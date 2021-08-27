const single = (resource, authUser) => ({
	user_id: resource.user_id,
	username: resource.username,
	fullname: resource.fullname,
	email: resource.email,
	photo: resource.photo,
	status: resource.status,
	rol_id: resource.rol_id,
	theme: resource.theme,
	logged_in: resource.logged_in,
	language: resource.language,
	created_on: authUser.rol_id === 'admin' ? resource.created_on : undefined,
	last_login: authUser.rol_id === 'admin' ? resource.last_login : undefined,
});

const multiple = (resources, autUser) =>
	resources.map((res) => single(res, autUser));

module.exports = { single, multiple };
