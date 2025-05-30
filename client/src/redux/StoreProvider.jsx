import { store } from '@/src/redux/store'
import { Provider } from 'react-redux'

export default function StoreProvider({ children }) {
  return <Provider store={store}>{children}</Provider>
}