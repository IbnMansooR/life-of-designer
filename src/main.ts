// Kirish nuqtasi.
import './styles/main.css'
import { App } from './App'

const root = document.getElementById('app')
if (!root) throw new Error('#app topilmadi')

new App(root).start()
