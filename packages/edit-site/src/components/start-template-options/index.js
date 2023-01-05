/**
 * WordPress dependencies
 */
import { Modal } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState, useEffect, useMemo } from '@wordpress/element';
import { __experimentalBlockPatternsList as BlockPatternsList } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useAsyncList, useResizeObserver } from '@wordpress/compose';
import { store as preferencesStore } from '@wordpress/preferences';
import { parse } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';
import { store as coreStore, useEntityBlockEditor } from '@wordpress/core-data';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';

function useFallbackTemplateContent( slug, isCustom = false ) {
	const [ templateContent, setTemplateContent ] = useState( '' );

	useEffect( () => {
		apiFetch( {
			path: addQueryArgs( '/wp/v2/templates/lookup', {
				slug,
				is_custom: isCustom,
				ignore_empty: true,
			} ),
		} ).then( ( { content } ) => setTemplateContent( content.raw ) );
	}, [ slug ] );
	return templateContent;
}

const START_BLANK_TITLE = __( 'Start blank' );

function PatternSelection( { fallbackContent, onChoosePattern, postType } ) {
	const [ resizeObserver, sizes ] = useResizeObserver();
	const [ gridHeight, setGridHeight ] = useState( '320px' );
	const [ , , onChange ] = useEntityBlockEditor( 'postType', postType );
	const blockPatterns = useMemo(
		() => [
			{
				name: 'fallback',
				blocks: parse( fallbackContent ),
				title: __( 'Fallback content' ),
			},
			{
				name: 'start-blank',
				blocks: parse(
					'<!-- wp:paragraph --><p></p><!-- /wp:paragraph -->'
				),
				title: START_BLANK_TITLE,
			},
		],
		[ fallbackContent ]
	);
	const shownBlockPatterns = useAsyncList( blockPatterns );
	useEffect( () => {
		const elementOffSetWidth = window?.document?.querySelector(
			'.edit-site-start-template-options__pattern-container .block-editor-block-patterns-list__list-item'
		)?.offsetWidth;
		if ( elementOffSetWidth ) {
			setGridHeight( `${ ( elementOffSetWidth * 4 ) / 3 }px` );
		}
	}, [ blockPatterns, sizes.width ] );
	return (
		<div
			className="edit-site-start-template-options__pattern-container"
			style={ {
				'--wp-edit-site-start-template-options-start-blank': `"${ START_BLANK_TITLE }"`,
				'--wp-edit-site-start-template-options-grid-height': gridHeight,
			} }
		>
			{ resizeObserver }
			<BlockPatternsList
				blockPatterns={ blockPatterns }
				shownPatterns={ shownBlockPatterns }
				onClickPattern={ ( pattern, blocks ) => {
					onChange( 'start-blank' === pattern.name ? [] : blocks, {
						selection: undefined,
					} );
					onChoosePattern();
				} }
			/>
		</div>
	);
}

function StartModal( { slug, isCustom, onClose, postType } ) {
	const fallbackContent = useFallbackTemplateContent( slug, isCustom );
	if ( ! fallbackContent ) {
		return null;
	}
	return (
		<Modal
			className="edit-site-start-template-options__modal"
			title={ __( 'Choose a pattern' ) }
			closeLabel={ __( 'Cancel' ) }
			focusOnMount="firstElement"
			onRequestClose={ onClose }
		>
			<div className="edit-site-start-template-options__modal-content">
				<PatternSelection
					fallbackContent={ fallbackContent }
					slug={ slug }
					isCustom={ isCustom }
					postType={ postType }
					onChoosePattern={ () => {
						onClose();
					} }
				/>
			</div>
		</Modal>
	);
}

const START_TEMPLATE_MODAL_STATES = {
	INITIAL: 'INITIAL',
	PATTERN: 'PATTERN',
	CLOSED: 'CLOSED',
};

export default function StartTemplateOptions() {
	const [ modalState, setModalState ] = useState(
		START_TEMPLATE_MODAL_STATES.INITIAL
	);
	const { shouldOpenModel, slug, isCustom, postType } = useSelect(
		( select ) => {
			const { getEditedPostType, getEditedPostId } =
				select( editSiteStore );
			const _postType = getEditedPostType();
			const postId = getEditedPostId();
			const {
				__experimentalGetDirtyEntityRecords,
				getEditedEntityRecord,
			} = select( coreStore );
			const templateRecord = getEditedEntityRecord(
				'postType',
				_postType,
				postId
			);

			const hasDirtyEntityRecords =
				__experimentalGetDirtyEntityRecords().length > 0;

			return {
				shouldOpenModel:
					modalState === START_TEMPLATE_MODAL_STATES.INITIAL &&
					! hasDirtyEntityRecords &&
					'' === templateRecord.content &&
					'wp_template' === _postType &&
					! select( preferencesStore ).get(
						'core/edit-site',
						'welcomeGuide'
					),
				slug: templateRecord.slug,
				isCustom: templateRecord.is_custom,
				postType: _postType,
			};
		},
		[ modalState ]
	);

	useEffect( () => {
		if ( shouldOpenModel ) {
			setModalState( START_TEMPLATE_MODAL_STATES.PATTERN );
		}
	}, [ shouldOpenModel ] );

	if (
		modalState === START_TEMPLATE_MODAL_STATES.INITIAL ||
		modalState === START_TEMPLATE_MODAL_STATES.CLOSED
	) {
		return null;
	}
	return (
		<StartModal
			slug={ slug }
			isCustom={ isCustom }
			postType={ postType }
			onClose={ () =>
				setModalState( START_TEMPLATE_MODAL_STATES.CLOSED )
			}
		/>
	);
}
