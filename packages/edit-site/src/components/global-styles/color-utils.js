/**
 * WordPress dependencies
 */
import { experiments as blockEditorExperiments } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../experiments';

const { getSupportedGlobalStylesPanels } = unlock( blockEditorExperiments );

export function useHasColorPanel( name ) {
	const supports = getSupportedGlobalStylesPanels( name );
	return (
		supports.includes( 'color' ) ||
		supports.includes( 'backgroundColor' ) ||
		supports.includes( 'background' ) ||
		supports.includes( 'linkColor' )
	);
}
