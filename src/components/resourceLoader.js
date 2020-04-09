import { api } from '../Lib';

export function loadFile(url) {
	return api.get(url)
	.then(res => {
		console.log(res)
		return new File([res.data], 'sass.jpg', {type: res.headers['content-type']})
	})
}
