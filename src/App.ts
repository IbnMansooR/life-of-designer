// App — ekranlar oqimini boshqaradi: Launcher -> Qahramon yaratish -> Game.
import { Launcher, loadSettings } from './ui/Launcher'
import { CharacterCreate } from './ui/CharacterCreate'
import { Game } from './game/Game'
import { GameState, type SerializedGame } from './game/GameState'
import { loadGame } from './core/Save'

export class App {
  private launcher: Launcher
  private creator: CharacterCreate
  private game: Game | null = null

  constructor(private root: HTMLElement) {
    this.launcher = new Launcher(root, {
      onNew: () => this.showCreator(),
      onContinue: () => void this.continueGame()
    })
    this.creator = new CharacterCreate(root, {
      onStart: (name, fam, appearance) => this.startGame(GameState.newGame(name, fam, appearance)),
      onBack: () => {
        this.creator.hide()
        this.launcher.show()
      }
    })
  }

  async start(): Promise<void> {
    await this.launcher.refreshContinue()
    this.launcher.show()
  }

  private showCreator(): void {
    this.launcher.hide()
    this.creator.show()
  }

  private async continueGame(): Promise<void> {
    const data = await loadGame<SerializedGame>('slot1')
    if (!data) return
    this.startGame(GameState.fromSerialized(data))
  }

  private startGame(gs: GameState): void {
    this.launcher.hide()
    this.creator.hide()
    this.game?.dispose()
    const settings = loadSettings()
    gs.settings.sensitivity = settings.sensitivity
    gs.settings.defaultSpeed = settings.gameSpeed
    this.game = new Game(this.root, gs, { onExitToMenu: () => void this.exitToMenu() })
    this.game.start()
  }

  private async exitToMenu(): Promise<void> {
    this.game?.dispose()
    this.game = null
    await this.launcher.refreshContinue()
    this.launcher.show()
  }
}
