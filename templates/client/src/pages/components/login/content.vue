<template>
	<vc-form
		ref="form"
		:model="formValidate"
		:rules="ruleValidate"
		:label-width="120"
		style="height: 100vh"
		position="left"
		class="g-flex-cc g-fd-c"
	>
		<vc-form-item prop="email" label="邮箱：">
			<vc-input
				v-model="formValidate.email"
				placeholder="邮箱，没有会自动注册哦"
			/>
		</vc-form-item>
		<vc-form-item prop="password" label="密码：">
			<vc-input
				v-model="formValidate.password"
				type="password"
				placeholder="密码"
			/>
		</vc-form-item>
		<div @click="handleLogin">
			登录
		</div>
	</vc-form>
</template>

<script>
import { mapState } from 'vuex';
import { Message, Modal } from '@wya/vc';
import { Storage } from '@utils/utils';
import { Global } from '@routers/_global';

export default {
	name: 'login',
	components: {
	},
	data() {
		return {
			formValidate: {
				email: '',
				password: ''
			},
			ruleValidate: {
				email: [
					{
						type: 'email',
						message: "请输入正确的邮箱"
					},
					{
						required: true,
						message: "请输入邮箱"
					}
				],
				password: [
					{
						required: true,
						message: '请输入密码'
					}
				]
			},
		};
	},
	computed: {
		...mapState(['loginMain'])
	},
	created() {

	},
	methods: {
		async handleLogin() {
			await this.$refs.form.validate();
			const { password, email } = this.formValidate;
			try {
				await this._login();
			} catch (err) {
				return new Promise((resolve, reject) => {
					if (err.msg !== '当前账号未注册') return reject(err);
					const content = (h) => (
						<p style="color: #495060">
							该用户不存在, 是否根据当前输入的用户名和密码注册用户?注：请妥善保管好你的密码: ({password})，目前无法提供找回密码的通道。
						</p>
					);
					Modal.warning({
						title: "提示",
						content,
						onOk: async (e, done) => {
							try {
								await this._register();
								await this._login();
								Message.success(`登录成功 - username: ${username}`);
								done();
								resolve();
							} catch (errors) {
								reject(errors);
							}
						}
					});
				});
			}
		},
		_login() {
			const { password, email } = this.formValidate;
			return this.request({
				url: 'LOGIN_MAIN_POST',
				type: "POST",
				param: {
					password,
					email
				}
			}).then((res) => {
				this.$global.createLoginAuth({ token: res.data.token }, true);
			});
		},
		_register() {
			const { password, email } = this.formValidate;
			return this.request({
				url: 'LOGIN_REGISTER_POST',
				type: "POST",
				param: {
					password,
					email
				}
			});
		},
	},
};
</script>

<style lang="scss">
</style>
