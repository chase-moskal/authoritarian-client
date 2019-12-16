
import {UserPanel} from "../components/user-panel.js"
import {UserAvatar} from "../components/user-avatar.js"
import {ProfilePanel} from "../components/profile-panel.js"
import {PaywallPanel} from "../components/paywall-panel.js"
import {PrivateVimeo} from "../components/private-vimeo.js"
import {AvatarDisplay} from "../components/avatar-display.js"
import {QuestionsForum} from "../components/questions-forum.js"

import {createUserModel} from "../models/user-model.js"
import {createProfileModel} from "../models/profile-model.js"
import {createPaywallModel} from "../models/paywall-model.js"
import {createQuestionsModel} from "../models/questions-model.js"

import {provideModel} from "../framework/provide-model.js"
import {AuthoritarianStartupError} from "../system/errors.js"

import {AuthoritarianOptions} from "../interfaces.js"

const err = (message: string) => new AuthoritarianStartupError(message)

const validate = (condition: any, message: string) => {
	if (!condition) throw err(message)
}

export function prepareComponents({
	tokenStorage,
	paywallGuardian,
	questionsBureau,
	profileMagistrate,
	privateVimeoGovernor,

	loginPopupRoutine,
	decodeAccessToken,
}: AuthoritarianOptions) {

	validate(
		tokenStorage && decodeAccessToken && loginPopupRoutine,
		"must have tokenStorage, decodeAccessToken, and "
			+ "loginPopupRoutine to instantiate the user model"
	)

	//
	// instance the models
	//

	const user = createUserModel({
		tokenStorage,
		decodeAccessToken,
		loginPopupRoutine,
	})

	const paywall = createPaywallModel({
		paywallGuardian,
	})

	const profile = createProfileModel({
		profileMagistrate
	})

	const questions = createQuestionsModel({questionsBureau})

	//
	// wire models to each other
	//

	user.reader.subscribe(paywall.receiveUserUpdate)
	user.reader.subscribe(profile.receiveUserUpdate)
	user.reader.subscribe(questions.receiveUserUpdate)
	profile.reader.subscribe(state => questions.updateProfile(state.profile))
	paywall.subscribeLoginWithAccessToken(user.receiveLoginWithAccessToken)

	//
	// give back components and high level start function
	//

	return {
		components: {
			AvatarDisplay,
			PrivateVimeo: <typeof PrivateVimeo>class extends PrivateVimeo {
				static vimeoGovernor = privateVimeoGovernor
				static user = user
			},
			UserPanel: provideModel(user, UserPanel),
			UserAvatar: provideModel(profile, UserAvatar),
			ProfilePanel: provideModel(profile, ProfilePanel),
			PaywallPanel: provideModel(paywall, PaywallPanel),
			QuestionsForum: provideModel(questions, QuestionsForum),
		},
		async start() {
			return user.start()
		}
	}
}