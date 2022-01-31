import { observer } from 'mobx-react-lite'
import { FC, useContext, useEffect, useState } from 'react'
import { Context } from '.'
import LoginForm from './components/LoginForm'
import { IUser } from './models/IUser'
import UserService from './services/User'

const App: FC = () => {
	const { store } = useContext(Context)
	const [users, setUsers] = useState<IUser[]>([])

	useEffect(() => {
		if (localStorage.getItem('token')) {
			store.checkAuth()
		}
	}, [])

	async function getUsers() {
		try {
			const response = await UserService.fetchUsers()
			setUsers(response.data)
		} catch (e) {
			console.log(e)
		}
	}

	if (store.isLoading) {
		return <h1>Loading...</h1>
	}

	if (!store.isAuth) {
		return <LoginForm />
	}

	return (
		<div>
			<h1>{ store.isAuth ? `User ${ store.user.email } is logged in` : 'Authorize' }</h1>
			<h1>{ store.user.isActivated
						? `User ${ store.user.email } is activated by email`
						: 'Activate your account by email' }</h1>
			<button onClick={ () => store.logout() }>Logout</button>
			<div>
				<button onClick={ getUsers }>Get all users</button>
			</div>
			{ users.map(user => (
				<div key={ user.id }>{ user.email }</div>
			)) }
		</div>
	)
}

export default observer(App)
