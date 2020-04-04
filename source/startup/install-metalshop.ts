
import {theme} from "../system/theme.js"
import {MetalOptions} from "../interfaces.js"
import {themeComponents} from "../framework/theme-components.js"
import {registerComponents} from "../toolbox/register-components.js"

import {wireComponents} from "./more/wire-components.js"
import {optionsFromDom} from "./more/options-from-dom.js"
import {prepareSupermodel} from "./more/prepare-supermodel.js"

export async function installMetalshop(options?: MetalOptions) {
	options = options || await optionsFromDom("metal-config")
	const supermodel = prepareSupermodel(options)
	const components = wireComponents(supermodel)
	registerComponents(themeComponents(theme, components))
	return {
		supermodel,
		async start() {
			await supermodel.auth.useExistingLogin()
		}
	}
}
