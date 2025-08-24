import { ref, onMounted } from 'vue';

interface UrlParams {
	query: Record<string, string>;
	path: string[];
	pathSegments: Record<string, string>;
}

export function useQueryParams() {
	const params = ref<UrlParams>({
		query: {},
		path: [],
		pathSegments: {},
	});

	const updateParams = () => {
		const searchParams = new URLSearchParams(window.location.search);
		const queryParams: Record<string, string> = {};

		searchParams.forEach((value, key) => {
			queryParams[key] = value;
		});

		const path = window.location.pathname;
		const pathSegments = path.split('/').filter(segment => segment !== '');

		params.value = {
			query: queryParams,
			path: pathSegments,
			pathSegments: {},
			// pathSegments: namedPathSegments,
		};
	}

	onMounted(updateParams);

	return {
		params,
		getParam: (key: string, defaultValue: string | null = null): string | any => params.value.query[key] || defaultValue,
		hasParam: (key: string): boolean => key in params.value.query,
		getSegment: (index: number): string | null => {
			if (index < 0) {
				return params.value.path[params.value.path.length + index] || null;
			}

			return params.value.path[index] || null;
		},
	};
}
