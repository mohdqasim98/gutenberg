/**
 * External dependencies
 */
import fastDeepEqual from 'fast-deep-equal/es6';
import { get, set } from 'lodash';

/**
 * WordPress dependencies
 */
import { useContext, useCallback, useMemo } from '@wordpress/element';
import {
	getBlockType,
	__EXPERIMENTAL_STYLE_PROPERTY as STYLE_PROPERTY,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { getValueFromVariable, getPresetVariableFromValue } from './utils';
import { GlobalStylesContext } from './context';

const EMPTY_CONFIG = { settings: {}, styles: {} };

const VALID_SETTINGS = [
	'appearanceTools',
	'useRootPaddingAwareAlignments',
	'border.color',
	'border.radius',
	'border.style',
	'border.width',
	'shadow.presets',
	'shadow.defaultPresets',
	'color.background',
	'color.custom',
	'color.customDuotone',
	'color.customGradient',
	'color.defaultDuotone',
	'color.defaultGradients',
	'color.defaultPalette',
	'color.duotone',
	'color.gradients',
	'color.link',
	'color.palette',
	'color.text',
	'custom',
	'dimensions.minHeight',
	'layout.contentSize',
	'layout.definitions',
	'layout.wideSize',
	'position.fixed',
	'position.sticky',
	'spacing.customSpacingSize',
	'spacing.spacingSizes',
	'spacing.spacingScale',
	'spacing.blockGap',
	'spacing.margin',
	'spacing.padding',
	'spacing.units',
	'typography.fuild',
	'typography.customFontSize',
	'typography.dropCap',
	'typography.fontFamilies',
	'typography.fontSizes',
	'typography.fontStyle',
	'typography.fontWeight',
	'typography.letterSpacing',
	'typography.lineHeight',
	'typography.textDecoration',
	'typography.textTransform',
];

export const useGlobalStylesReset = () => {
	const { user: config, setUserConfig } = useContext( GlobalStylesContext );
	const canReset = !! config && ! fastDeepEqual( config, EMPTY_CONFIG );
	return [
		canReset,
		useCallback(
			() => setUserConfig( () => EMPTY_CONFIG ),
			[ setUserConfig ]
		),
	];
};

export function useGlobalSetting( propertyPath, blockName, source = 'all' ) {
	const {
		merged: mergedConfig,
		base: baseConfig,
		user: userConfig,
		setUserConfig,
	} = useContext( GlobalStylesContext );

	const pathParts = [ 'settings' ];
	if ( blockName ) {
		pathParts.push( `blocks.${ blockName }` );
	}
	if ( propertyPath ) {
		pathParts.push( propertyPath );
	}
	const fullPath = pathParts.join( '.' );

	const setSetting = ( newValue ) => {
		setUserConfig( ( currentConfig ) => {
			// Deep clone `currentConfig` to avoid mutating it later.
			const newUserConfig = JSON.parse( JSON.stringify( currentConfig ) );
			set( newUserConfig, fullPath, newValue );

			return newUserConfig;
		} );
	};

	const getSettingValueForContext = ( currentBlockName, settingPath ) => {
		const currentPathParts = [ 'settings' ];
		if ( currentBlockName ) {
			currentPathParts.push( `blocks.${ currentBlockName }` );
		}
		currentPathParts.push( settingPath );
		const currentPath = currentPathParts.join( '.' );

		let result;
		switch ( source ) {
			case 'all':
				result = get( mergedConfig, currentPath );
				break;
			case 'user':
				result = get( userConfig, currentPath );
				break;
			case 'base':
				result = get( baseConfig, currentPath );
				break;
			default:
				throw 'Unsupported source';
		}

		return result;
	};

	// Unlike styles settings get inherited from top level settings.
	const resultWithFallback = useMemo( () => {
		if ( propertyPath ) {
			return (
				getSettingValueForContext( blockName, propertyPath ) ??
				getSettingValueForContext( undefined, propertyPath )
			);
		}
		const result = {};
		VALID_SETTINGS.forEach( ( setting ) => {
			set(
				result,
				setting,
				getSettingValueForContext( blockName, setting ) ??
					getSettingValueForContext( undefined, setting )
			);
		} );
		return result;
	}, [
		mergedConfig,
		userConfig,
		baseConfig,
		blockName,
		propertyPath,
		source,
	] );

	return [ resultWithFallback, setSetting ];
}

export function useGlobalStyle( path, blockName, source = 'all' ) {
	const {
		merged: mergedConfig,
		base: baseConfig,
		user: userConfig,
		setUserConfig,
	} = useContext( GlobalStylesContext );
	const appendedPath = path ? '.' + path : '';
	const finalPath = ! blockName
		? `styles${ appendedPath }`
		: `styles.blocks.${ blockName }${ appendedPath }`;

	const setStyle = ( newValue ) => {
		setUserConfig( ( currentConfig ) => {
			// Deep clone `currentConfig` to avoid mutating it later.
			const newUserConfig = JSON.parse( JSON.stringify( currentConfig ) );
			set(
				newUserConfig,
				finalPath,
				getPresetVariableFromValue(
					mergedConfig.settings,
					blockName,
					path,
					newValue
				)
			);
			return newUserConfig;
		} );
	};

	let result;
	switch ( source ) {
		case 'all':
			result = getValueFromVariable(
				mergedConfig,
				blockName,
				// The stlyes.css path is allowed to be empty, so don't revert to base if undefined.
				finalPath === 'styles.css'
					? get( userConfig, finalPath )
					: get( userConfig, finalPath ) ??
							get( baseConfig, finalPath )
			);
			break;
		case 'user':
			result = getValueFromVariable(
				mergedConfig,
				blockName,
				get( userConfig, finalPath )
			);
			break;
		case 'base':
			result = getValueFromVariable(
				baseConfig,
				blockName,
				get( baseConfig, finalPath )
			);
			break;
		default:
			throw 'Unsupported source';
	}

	return [ result, setStyle ];
}

const ROOT_BLOCK_SUPPORTS = [
	'background',
	'backgroundColor',
	'color',
	'linkColor',
	'buttonColor',
	'fontFamily',
	'fontSize',
	'fontStyle',
	'fontWeight',
	'lineHeight',
	'padding',
	'contentSize',
	'wideSize',
	'blockGap',
];

function filterElementBlockSupports( blockSuppots, name, element ) {
	const filteredBlockSupports = blockSuppots.filter( ( support ) => {
		if ( support === 'fontSize' && element === 'heading' ) {
			return false;
		}

		// This is only available for links
		if ( support === 'textDecoration' ) {
			return false;
		}

		return true;
	} );

	if ( ! name && element === 'heading' ) {
		filteredBlockSupports.push( 'textTransform' );
	}

	if ( ! name && element === 'link' ) {
		filteredBlockSupports.push( 'textDecoration' );
	}

	return filteredBlockSupports;
}

export function getSupportedGlobalStylesPanels( name, element ) {
	if ( ! name ) {
		return filterElementBlockSupports( ROOT_BLOCK_SUPPORTS, name, element );
	}

	const blockType = getBlockType( name );

	if ( ! blockType ) {
		return [];
	}

	const supportKeys = [];

	// Check for blockGap support.
	// Block spacing support doesn't map directly to a single style property, so needs to be handled separately.
	// Also, only allow `blockGap` support if serialization has not been skipped, to be sure global spacing can be applied.
	if (
		blockType?.supports?.spacing?.blockGap &&
		blockType?.supports?.spacing?.__experimentalSkipSerialization !==
			true &&
		! blockType?.supports?.spacing?.__experimentalSkipSerialization?.some?.(
			( spacingType ) => spacingType === 'blockGap'
		)
	) {
		supportKeys.push( 'blockGap' );
	}

	Object.keys( STYLE_PROPERTY ).forEach( ( styleName ) => {
		if ( ! STYLE_PROPERTY[ styleName ].support ) {
			return;
		}

		// Opting out means that, for certain support keys like background color,
		// blocks have to explicitly set the support value false. If the key is
		// unset, we still enable it.
		if ( STYLE_PROPERTY[ styleName ].requiresOptOut ) {
			if (
				STYLE_PROPERTY[ styleName ].support[ 0 ] in
					blockType.supports &&
				get(
					blockType.supports,
					STYLE_PROPERTY[ styleName ].support
				) !== false
			) {
				return supportKeys.push( styleName );
			}
		}

		if (
			get(
				blockType.supports,
				STYLE_PROPERTY[ styleName ].support,
				false
			)
		) {
			return supportKeys.push( styleName );
		}
	} );

	return filterElementBlockSupports( supportKeys, name, element );
}
