/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import {
	__experimentalColorGradientControl as ColorGradientControl,
	experiments as blockEditorExperiments,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import ScreenHeader from './header';
import { getSupportedGlobalStylesPanels, useColorsPerOrigin } from './hooks';
import { unlock } from '../../experiments';

const { useGlobalSetting, useGlobalStyle } = unlock( blockEditorExperiments );

function ScreenButtonColor( { name, variationPath = '' } ) {
	const supports = getSupportedGlobalStylesPanels( name );
	const [ solids ] = useGlobalSetting( 'color.palette', name );
	const [ areCustomSolidsEnabled ] = useGlobalSetting( 'color.custom', name );

	const colorsPerOrigin = useColorsPerOrigin( name );

	const [ isBackgroundEnabled ] = useGlobalSetting(
		'color.background',
		name
	);

	const hasButtonColor =
		supports.includes( 'buttonColor' ) &&
		isBackgroundEnabled &&
		( solids.length > 0 || areCustomSolidsEnabled );

	const [ buttonTextColor, setButtonTextColor ] = useGlobalStyle(
		variationPath + 'elements.button.color.text',
		name
	);
	const [ userButtonTextColor ] = useGlobalStyle(
		'elements.button.color.text',
		name,
		'user'
	);

	const [ buttonBgColor, setButtonBgColor ] = useGlobalStyle(
		'elements.button.color.background',
		name
	);
	const [ userButtonBgColor ] = useGlobalStyle(
		'elements.button.color.background',
		name,
		'user'
	);

	if ( ! hasButtonColor ) {
		return null;
	}

	return (
		<>
			<ScreenHeader
				title={ __( 'Buttons' ) }
				description={ __(
					'Set the default colors used for buttons across the site.'
				) }
			/>

			<h4 className="edit-site-global-styles-section-title">
				{ __( 'Text color' ) }
			</h4>

			<ColorGradientControl
				className="edit-site-screen-button-color__control"
				colors={ colorsPerOrigin }
				disableCustomColors={ ! areCustomSolidsEnabled }
				showTitle={ false }
				enableAlpha
				__experimentalIsRenderedInSidebar
				colorValue={ buttonTextColor }
				onColorChange={ setButtonTextColor }
				clearable={ buttonTextColor === userButtonTextColor }
			/>

			<h4 className="edit-site-global-styles-section-title">
				{ __( 'Background color' ) }
			</h4>

			<ColorGradientControl
				className="edit-site-screen-button-color__control"
				colors={ colorsPerOrigin }
				disableCustomColors={ ! areCustomSolidsEnabled }
				showTitle={ false }
				enableAlpha
				__experimentalIsRenderedInSidebar
				colorValue={ buttonBgColor }
				onColorChange={ setButtonBgColor }
				clearable={ buttonBgColor === userButtonBgColor }
			/>
		</>
	);
}

export default ScreenButtonColor;
