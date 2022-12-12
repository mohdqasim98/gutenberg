/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import ScreenHeader from './header';
import BorderPanel, { useHasBorderPanel } from './border-panel';
import BlockPreviewPanel from './block-preview-panel';
import { getVariationClassNameFromPath } from './utils';
import ShadowPanel, { useHasShadowControl } from './shadow-panel';

function ScreenBorder( { name, variationPath = '' } ) {
	const hasBorderPanel = useHasBorderPanel( name );
	const variationClassName = getVariationClassNameFromPath( variationPath );
	const hasShadowPanel = useHasShadowControl( name );
	return (
		<>
			<ScreenHeader title={ __( 'Border & Shadow' ) } />
			<BlockPreviewPanel name={ name } variation={ variationClassName } />
			{ hasBorderPanel && (
				<BorderPanel name={ name } variationPath={ variationPath } />
			) }
			{ hasShadowPanel && (
				<ShadowPanel name={ name } variationPath={ variationPath } />
			) }
		</>
	);
}

export default ScreenBorder;
