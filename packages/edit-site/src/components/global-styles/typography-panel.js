/**
 * WordPress dependencies
 */
import { experiments as blockEditorExperiments } from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import { unlock } from '../../experiments';

const {
	useGlobalStyle,
	useGlobalSetting,
	TypographyPanel: StylesTypographyPanel,
} = unlock( blockEditorExperiments );

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
	if ( variationPath ) {
		prefix = variationPath + prefix;
	}

	const [ style, setStyle ] = useGlobalStyle( prefix, name );
	const [ inheritedStyle ] = useGlobalStyle( prefix, name, 'user' );
	const [ settings ] = useGlobalSetting( '', name );

	return (
		<StylesTypographyPanel
			name={ name }
			element={ element === 'heading' ? headingLevel : element }
			inherit={ inheritedStyle }
			value={ style }
			onChange={ setStyle }
			settings={ settings }
		/>
	);
}
