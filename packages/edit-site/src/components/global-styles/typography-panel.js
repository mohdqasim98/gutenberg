/**
 * WordPress dependencies
 */
import { experiments as blockEditorExperiments } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../experiments';

const { useGlobalStyle, TypographyPanel: StylesTypographyPanel } = unlock(
	blockEditorExperiments
);

export default function TypographyPanel( {
	name,
	element,
	headingLevel,
	variationPath = '',
} ) {
	let prefix = '';
	if ( element === 'heading' ) {
		prefix = `elements.${ headingLevel }.`;
	} else if ( element && element !== 'text' ) {
		prefix = `elements.${ element }.`;
	}
	const [ style, setStyle ] = useGlobalStyle( variationPath + prefix, name );
	const [ inheritedStyle ] = useGlobalStyle(
		variationPath + prefix,
		name,
		'user'
	);

	return (
		<StylesTypographyPanel
			inherit={ inheritedStyle }
			value={ style }
			onChange={ setStyle }
			name={ name }
			element={ element === 'heading' ? headingLevel : element }
		/>
	);
}
