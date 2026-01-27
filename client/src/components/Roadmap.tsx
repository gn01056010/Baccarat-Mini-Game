import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { RoadmapCell } from "@shared/schema";

interface RoadmapProps {
  roadmaps: {
    beadPlate: RoadmapCell[][];
    bigRoad: RoadmapCell[][];
    bigEyeBoy: string[][];
    smallRoad: string[][];
    cockroachRoad: string[][];
  };
}

export function Roadmap({ roadmaps }: RoadmapProps) {
  return (
    <div className="w-full bg-black/40 border-t-4 border-[hsl(var(--casino-gold))] backdrop-blur-md p-2 md:p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-2 h-[220px] md:h-[200px]">
        
        {/* Bead Plate (Standard history) */}
        <ScrollArea className="w-full md:w-1/3 h-full bg-white/5 rounded border border-white/10">
          <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] min-w-max">
            {roadmaps.beadPlate.map((col, i) => (
              <div key={i} className="contents">
                <div className="absolute top-0 left-0 px-2 py-0.5 text-[10px] text-white/40 uppercase tracking-tighter bg-white/5 z-10">珠盤路</div>
                {col.map((cell, j) => (
                  <BeadCell key={`${i}-${j}`} cell={cell} />
                ))}
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Big Road & Derived Roads Container */}
        <div className="w-full md:w-2/3 h-full flex flex-col gap-1">
          
          {/* Big Road */}
          <ScrollArea className="flex-1 bg-white/5 rounded border border-white/10 relative">
            <div className="absolute top-0 left-0 px-2 py-0.5 text-[10px] text-white/40 uppercase tracking-tighter bg-white/5 z-10">大路</div>
            <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] min-w-max">
               {roadmaps.bigRoad.map((col, i) => (
                 <div key={i} className="contents">
                   {col.map((cell, j) => (
                     <BigRoadCell key={`br-${i}-${j}`} cell={cell} />
                   ))}
                 </div>
               ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Derived Roads (Bottom Half) - Simplified for layout */}
          <div className="h-1/3 flex gap-1">
             {/* Big Eye Boy */}
             <div className="w-1/3 bg-white/5 border border-white/10 relative overflow-hidden">
               <div className="absolute top-0 left-0 px-1 py-0.5 text-[7px] text-white/30 uppercase bg-black/40 z-10">大眼仔</div>
               <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px]">
                  {/* Rendering placeholder for complex derived roads */}
                  {roadmaps.bigEyeBoy.slice(0, 20).map((col, i) => col.map((val, j) => (
                    val && <div key={`beb-${i}-${j}`} className={cn("w-1.5 h-1.5 rounded-full border", val === 'red' ? "border-red-500" : "border-blue-500")} style={{ gridColumn: i+1, gridRow: j+1 }} />
                  )))}
               </div>
             </div>
             {/* Small Road */}
             <div className="w-1/3 bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 px-1 py-0.5 text-[7px] text-white/30 uppercase bg-black/40 z-10">小路</div>
                <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px]">
                  {roadmaps.smallRoad.slice(0, 20).map((col, i) => col.map((val, j) => (
                    val && <div key={`sr-${i}-${j}`} className={cn("w-1.5 h-1.5 rounded-full bg-current", val === 'red' ? "text-red-500" : "text-blue-500")} style={{ gridColumn: i+1, gridRow: j+1 }} />
                  )))}
               </div>
             </div>
             {/* Cockroach Road */}
             <div className="w-1/3 bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 px-1 py-0.5 text-[7px] text-white/30 uppercase bg-black/40 z-10">蟑螂路</div>
                <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px]">
                  {roadmaps.cockroachRoad.slice(0, 20).map((col, i) => col.map((val, j) => (
                    val && <div key={`cr-${i}-${j}`} className={cn("w-1.5 h-[1px] bg-current transform -rotate-45 origin-center", val === 'red' ? "text-red-500" : "text-blue-500")} style={{ gridColumn: i+1, gridRow: j+1 }} />
                  )))}
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components for cells
function BeadCell({ cell }: { cell: RoadmapCell }) {
  if (!cell) return <div className="w-6 h-6 md:w-8 md:h-8 bg-white/5" />;

  const bgColor = {
    player: "bg-[hsl(var(--player-blue))]",
    banker: "bg-[hsl(var(--banker-red))]",
    tie: "bg-[hsl(var(--tie-green))]",
  }[cell.winner];

  return (
    <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center p-0.5 relative bg-white/5">
      <div className={cn("w-full h-full rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-sm", bgColor)}>
        {cell.winner === 'player' ? '閒' : cell.winner === 'banker' ? '莊' : '和'}
        {cell.isPair && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white border border-black" />}
      </div>
    </div>
  );
}

function BigRoadCell({ cell }: { cell: RoadmapCell }) {
  if (!cell) return <div className="w-3 h-3 md:w-4 md:h-4 bg-transparent" />;

  const borderColor = {
    player: "border-[hsl(var(--player-blue))]",
    banker: "border-[hsl(var(--banker-red))]",
    tie: "border-[hsl(var(--tie-green))]",
  }[cell.winner];

  return (
    <div className="w-3 h-3 md:w-4 md:h-4 flex items-center justify-center relative">
      <div className={cn("w-[80%] h-[80%] rounded-full border-2 bg-transparent", borderColor)}>
        {cell.winner === 'tie' && <div className="w-full h-[1px] bg-[hsl(var(--tie-green))] rotate-45 transform" />}
      </div>
    </div>
  );
}
