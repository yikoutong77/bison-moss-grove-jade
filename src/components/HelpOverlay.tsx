import { X } from "lucide-react";
import { useGame } from "@/game/store";

export function HelpOverlay() {
  const help = useGame((s) => s.help);
  const setHelp = useGame((s) => s.setHelp);
  if (!help) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-bg-deep/70 p-4">
      <div className="panel relative max-h-[85%] w-full max-w-lg overflow-y-auto rounded-2xl p-6">
        <button
          type="button"
          className="absolute right-3 top-3 grid size-10 place-items-center rounded-full border border-border"
          onClick={() => setHelp(false)}
          aria-label="关闭"
        >
          <X className="size-4" />
        </button>
        <h3 className="font-display text-2xl font-bold">玩法说明</h3>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
          <p>酒馆在上、战场在中、手牌在下。把随从拖到战场购买或上场，拖到左侧鲍勃处卖掉。点头像可查看对手。</p>
          <p>开局从四位英雄中选一位。技能每回合只能放一次。护甲会先于生命吸收战斗伤害。</p>
          <p>购买先进手牌，再拖或点到战场才会触发战吼。结束回合后自动开战、自动结算，然后回到酒馆。</p>
          <p>购买 3 金，刷新 1 金，出售返还 1 金。冻结的随从刷新后留在原位。点顶栏头像可看对手棋盘，战报可回看近几场。</p>
          <p>战斗同时结算，打死对方也会被反击。失败扣「酒馆等级 + 剩余随从星级」，护甲先扣。点时间轴可回看每一拍进攻，大厅战报也能重播。</p>
        </div>
        <button type="button" className="action-btn primary mt-6 w-full" onClick={() => setHelp(false)}>
          知道了
        </button>
      </div>
    </div>
  );
}
