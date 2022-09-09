const single = (resource, authUser) => {
	if (!resource) return {};
	if (!resource.email) return {};

	return {
		user_id: resource.user_id || '',
		username: resource.username || '',
		fullname: resource.fullname || '',
		email: resource.email || '',
		photo: resource.photo || null,
		status: resource.status || 1,
		rol_id: resource.rol_id || '',
		theme: resource.theme || undefined,
		logged_in: resource.logged_in || null,
		language: resource.language || 'EN',
		created_on:
			authUser && authUser.rol_id === 'admin' ? resource.created_on : undefined,
		last_login:
			authUser && authUser.rol_id === 'admin' ? resource.last_login : undefined,
	};
};

const multiple = (resources, autUser) => {
	if (!(resources instanceof Array)) return [];
	return resources.map((res) => single(res, autUser));
};

module.exports = { single, multiple };
