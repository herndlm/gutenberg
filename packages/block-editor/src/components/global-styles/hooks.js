/**
 * External dependencies
 */
import fastDeepEqual from 'fast-deep-equal/es6';
import { get, set } from 'lodash';

/**
 * WordPress dependencies
 */
import { useContext, useCallback } from '@wordpress/element';
import { __EXPERIMENTAL_PATHS_WITH_MERGE as PATHS_WITH_MERGE } from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import { getValueFromVariable, getPresetVariableFromValue } from './utils';
import { GlobalStylesContext } from './context';

const EMPTY_CONFIG = { settings: {}, styles: {} };

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

export function useGlobalSetting( path, blockName, source = 'all' ) {
	const {
		merged: mergedConfig,
		base: baseConfig,
		user: userConfig,
		setUserConfig,
	} = useContext( GlobalStylesContext );

	const fullPath = ! blockName
		? `settings.${ path }`
		: `settings.blocks.${ blockName }.${ path }`;

	const setSetting = ( newValue ) => {
		setUserConfig( ( currentConfig ) => {
			// Deep clone `currentConfig` to avoid mutating it later.
			const newUserConfig = JSON.parse( JSON.stringify( currentConfig ) );
			const pathToSet = PATHS_WITH_MERGE[ path ]
				? fullPath + '.custom'
				: fullPath;
			set( newUserConfig, pathToSet, newValue );

			return newUserConfig;
		} );
	};

	const getSettingValueForContext = ( name ) => {
		const currentPath = ! name
			? `settings.${ path }`
			: `settings.blocks.${ name }.${ path }`;

		const getSettingValue = ( configToUse ) => {
			const result = get( configToUse, currentPath );
			if ( PATHS_WITH_MERGE[ path ] ) {
				return result?.custom ?? result?.theme ?? result?.default;
			}
			return result;
		};

		let result;
		switch ( source ) {
			case 'all':
				result = getSettingValue( mergedConfig );
				break;
			case 'user':
				result = getSettingValue( userConfig );
				break;
			case 'base':
				result = getSettingValue( baseConfig );
				break;
			default:
				throw 'Unsupported source';
		}

		return result;
	};

	// Unlike styles settings get inherited from top level settings.
	const resultWithFallback =
		getSettingValueForContext( blockName ) ?? getSettingValueForContext();

	return [ resultWithFallback, setSetting ];
}

export function useGlobalStyle( path, blockName, source = 'all' ) {
	const {
		merged: mergedConfig,
		base: baseConfig,
		user: userConfig,
		setUserConfig,
	} = useContext( GlobalStylesContext );
	const finalPath = ! blockName
		? `styles.${ path }`
		: `styles.blocks.${ blockName }.${ path }`;

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
