/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { forwardRef } from '@wordpress/element';
import { plus } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { store as blockEditorStore } from '../../store';
import Inserter from '../inserter';

export const Appender = forwardRef( ( props, ref ) => {
	const { hideInserter, clientId } = useSelect( ( select ) => {
		const {
			getTemplateLock,
			__unstableGetEditorMode,
			getSelectedBlockClientId,
		} = select( blockEditorStore );

		const _clientId = getSelectedBlockClientId();

		return {
			clientId: getSelectedBlockClientId(),
			hideInserter:
				!! getTemplateLock( _clientId ) ||
				__unstableGetEditorMode() === 'zoom-out',
		};
	}, [] );

	if ( hideInserter ) {
		return null;
	}

	return (
		<div className="offcanvas-editor__appender">
			<Inserter
				ref={ ref }
				rootClientId={ clientId }
				position="bottom right"
				isAppender={ true }
				selectBlockOnInsert={ false }
				shouldDirectInsert={ false }
				__experimentalIsQuick
				renderToggle={ ( {
					onToggle,
					disabled,
					isOpen,
					hasSingleBlockType,
					toggleProps = {},
				} ) => {
					const { onClick, ...rest } = toggleProps;
					// Handle both onClick functions from the toggle and the parent component.
					function handleClick( event ) {
						if ( onToggle ) {
							onToggle( event );
						}
						if ( onClick ) {
							onClick( event );
						}
					}
					return (
						<Button
							icon={ plus }
							label={ __( 'Add menu item' ) }
							tooltipPosition="bottom"
							onClick={ handleClick }
							className="block-editor-inserter__toggle"
							aria-haspopup={
								! hasSingleBlockType ? 'true' : false
							}
							aria-expanded={
								! hasSingleBlockType ? isOpen : false
							}
							disabled={ disabled }
							{ ...rest }
						>
							{ __( 'Add menu item' ) }
						</Button>
					);
				} }
				{ ...props }
			/>
		</div>
	);
} );
