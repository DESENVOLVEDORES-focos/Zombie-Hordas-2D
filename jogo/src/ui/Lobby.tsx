import { getMap } from "../game/maps";
import { getRecord } from "../game/settings/records";
import { LobbyBackdrop } from "./LobbyBackdrop";
import { MenuButton } from "./common";

export function Lobby({
  mapId,
  onPlay,
  onCreate,
  onJoin,
  onMaps,
  onSettings,
  onExit,
}: {
  mapId: string;
  onPlay: () => void;
  onCreate: () => void;
  onJoin: () => void;
  onMaps: () => void;
  onSettings: () => void;
  onExit: () => void;
}) {
  const map = getMap(mapId);
  const rec = getRecord(mapId);
  return (
    <div className="relative h-full w-full overflow-hidden">
      <LobbyBackdrop />
      <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-14">
        <header className="fade-in">
          <div className="font-display text-xs uppercase tracking-[0.6em] text-blood">Sobrevivência · Top-Down · Hordas</div>
          <h1 className="flicker mt-2 font-display text-5xl font-bold uppercase leading-none tracking-[0.1em] text-white title-glow md:text-7xl">
            Última
            <br />
            <span className="text-toxic">Barricada</span>
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/55">
            Construa defesas, compre armas e segure a linha. Quantas hordas você aguenta?
          </p>
        </header>

        <div className="fade-in w-full max-w-md space-y-2.5" style={{ animationDelay: "0.1s" }}>
          <MenuButton variant="primary" onClick={onPlay} sub={`${map.name}${rec ? ` · recorde: horda ${rec.wave}` : ""}`}>
            Jogar
          </MenuButton>
          <MenuButton onClick={onCreate} sub="mapa + dificuldade">
            Criar partida
          </MenuButton>
          <MenuButton onClick={onJoin} sub="por código">
            Entrar em partida
          </MenuButton>
          <MenuButton onClick={onMaps} sub={map.name}>
            Selecionar mapa
          </MenuButton>
          <MenuButton onClick={onSettings}>Configurações</MenuButton>
          <MenuButton variant="danger" onClick={onExit}>
            Sair do jogo
          </MenuButton>
        </div>

        <footer className="hidden text-xs text-white/35 md:block">
          WASD mover · Mouse mirar · Clique atirar · R recarregar · E interagir · B loja · F barricada · T torreta · 1-6 armas
        </footer>
      </div>
    </div>
  );
}
