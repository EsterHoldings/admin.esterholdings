
import { defineStore } from "pinia";

type Errors = {
	[key: string]: string[];
};

type RootState = {
	errors: Errors;
	message: string | null;
};

export const useErrorStack = defineStore('errors', {
	state: () => ({
		errors: {} as Errors,
		message: null,
	} as RootState),

	getters: {
		get: (state) => (field: string): string | null => {
			return state.errors[field]?.[0] ?? null;
		},

		hasErrors: (state) => (): boolean => {
			return Object.keys(state.errors).length > 0;
		},

		has: (state) => (field: string): boolean => {
			return state.errors[field]?.[0] !== undefined;
		},

		currentMessage: (state) => (def: string | null = null): string | null => {
			return state.message || def;
		},
	},

	actions: {
		setErrors(errors: Errors) {
			this.errors = errors;
		},

		pushError(key: string, message: string) {
			this.errors[key] = [message];
		},

		flush() {
			this.errors = {};
			this.message = null;
		},

		reset(key: string) {
			if (this.has(key)) {
				const { [key]: _, ...rest } = this.errors;
				this.errors = rest;
			}
		},

		is(key: string) {
			return this.has(key);
		},
	},
});
