export const getHeaders = (token, content = '') => {
	switch ((content, token)) {
	case token:
		return {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		};
	case ('multipart', token):
		return {
			Accept: 'application/json',
			'Content-Type': 'multipart/form-data',
			Authorization: `Bearer ${token}`,
		};
	case 'multipart':
		return {
			Accept: 'application/json',
			'Content-Type': 'multipart/form-data',
			Authorization: `Bearer ${token}`,
		};

	default:
		return {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		};
	}
};
