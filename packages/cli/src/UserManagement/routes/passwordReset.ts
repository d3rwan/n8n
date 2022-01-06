/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable import/no-cycle */

import express = require('express');
import { v4 as uuidv4 } from 'uuid';
import { URL } from 'url';
import { genSaltSync, hashSync } from 'bcryptjs';

import { Db, ResponseHelper } from '../..';
import { N8nApp } from '../Interfaces';
import { isValidEmail, validatePassword } from '../UserManagementHelper';
import * as UserManagementMailer from '../email';
import type { PasswordResetRequest } from '../Interfaces';
import { issueJWT } from '../auth/jwt';

export function addPasswordResetNamespace(this: N8nApp): void {
	/**
	 * Send a password reset email.
	 */
	this.app.post(
		`/${this.restEndpoint}/forgot-password`,
		ResponseHelper.send(async (req: PasswordResetRequest.Email) => {
			const { email } = req.body;

			if (!email) {
				throw new ResponseHelper.ResponseError('Email is mandatory', undefined, 400);
			}

			if (!isValidEmail(email)) {
				throw new ResponseHelper.ResponseError('Invalid email address', undefined, 400);
			}

			if (!req.headers.host) {
				throw new ResponseHelper.ResponseError('No host found', undefined, 400);
			}

			const user = await Db.collections.User!.findOne({ email });

			if (!user) {
				throw new ResponseHelper.ResponseError('', undefined, 404);
			}

			user.resetPasswordToken = uuidv4();

			const { id, firstName, lastName, resetPasswordToken } = user;

			await Db.collections.User!.update(id, { resetPasswordToken });

			const baseUrl = `${req.protocol}://${req.headers.host}`;
			const url = new URL(`/${this.restEndpoint}/resolve-password-token`, baseUrl);
			url.searchParams.append('u', id);
			url.searchParams.append('t', resetPasswordToken);

			void UserManagementMailer.getInstance().passwordReset({
				email,
				firstName,
				lastName,
				passwordResetUrl: url.toString(),
				domain: req.headers.host,
			});
		}),
	);

	/**
	 * Verify password reset token and user ID.
	 */
	this.app.get(
		`/${this.restEndpoint}/resolve-password-token`,
		ResponseHelper.send(async (req: PasswordResetRequest.Credentials) => {
			const { t, u } = req.query;

			if (!t || !u) {
				throw new ResponseHelper.ResponseError('', undefined, 400);
			}

			const user = await Db.collections.User!.findOne({ resetPasswordToken: t, id: u });

			if (!user) {
				throw new ResponseHelper.ResponseError('', undefined, 404);
			}
		}),
	);

	/**
	 * Verify password reset token and user ID and update password.
	 */
	this.app.post(
		`/${this.restEndpoint}/change-password`,
		ResponseHelper.send(async (req: PasswordResetRequest.NewPassword, res: express.Response) => {
			const { token, id, password } = req.body;

			if (!token || !id) {
				throw new ResponseHelper.ResponseError('', undefined, 400);
			}

			const user = await Db.collections.User!.findOne({ resetPasswordToken: token, id });

			if (!user) {
				throw new ResponseHelper.ResponseError('', undefined, 404);
			}

			const validPassword = validatePassword(password);
			req.user.password = hashSync(validPassword, genSaltSync(10));
			req.user.resetPasswordToken = null;

			await Db.collections.User!.save(req.user);

			const userData = await issueJWT(req.user);
			res.cookie('n8n-auth', userData.token, { maxAge: userData.expiresIn, httpOnly: true });
		}),
	);
}