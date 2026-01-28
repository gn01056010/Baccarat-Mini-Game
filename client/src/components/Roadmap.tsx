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
    <div className="w-full bg-[#E5E5E5] border-t-4 border-[hsl(var(--casino-gold))] backdrop-blur-md p-2 md:p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-2 h-[220px] md:h-[200px]">
        
        {/* Bead Plate (Standard history) */}
        <ScrollArea className="w-full md:w-1/3 h-full bg-white/40 rounded border border-gray-300 relative group">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-gray-400/30 text-2xl font-bold uppercase tracking-[0.2em] select-none">珠盤路</span>
          </div>
          <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] min-w-max relative z-10">
            {roadmaps.beadPlate.map((col, i) => (
              <div key={i} className="contents">
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
          <ScrollArea className="flex-1 bg-white/40 rounded border border-gray-300 relative group">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-gray-400/30 text-3xl font-bold uppercase tracking-[0.3em] select-none">大路</span>
            </div>
            <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] min-w-max relative z-10">
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
             <div className="w-1/3 bg-white/40 border border-gray-300 relative overflow-hidden group">
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <span className="text-gray-400/30 text-xs font-bold uppercase tracking-wider select-none">大眼仔</span>
               </div>
               <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] relative z-10">
                  {roadmaps.bigEyeBoy.slice(0, 20).map((col, i) => col.map((val, j) => (
                    val && <div key={`beb-${i}-${j}`} className={cn("w-1.5 h-1.5 rounded-full border", val === 'red' ? "border-red-500" : "border-blue-500")} style={{ gridColumn: i+1, gridRow: j+1 }} />
                  )))}
               </div>
             </div>
             {/* Small Road */}
             <div className="w-1/3 bg-white/40 border border-gray-300 relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-gray-400/30 text-[10px] font-bold uppercase tracking-wider select-none">小路</span>
                </div>
                <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] relative z-10">
                  {roadmaps.smallRoad.slice(0, 20).map((col, i) => col.map((val, j) => (
                    val && <div key={`sr-${i}-${j}`} className={cn("w-1.5 h-1.5 rounded-full bg-current", val === 'red' ? "text-red-500" : "text-blue-500")} style={{ gridColumn: i+1, gridRow: j+1 }} />
                  )))}
               </div>
             </div>
             {/* Cockroach Road */}
             <div className="w-1/3 bg-white/40 border border-gray-300 relative overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-gray-400/30 text-[10px] font-bold uppercase tracking-wider select-none">蟑螂路</span>
                </div>
                <div className="grid grid-rows-6 grid-flow-col gap-[1px] p-[1px] relative z-10">
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
  if (!cell) return <div className="w-6 h-6 md:w-8 md:h-8" />;

  const bgColor = {
    player: "bg-[hsl(var(--player-blue))]",
    banker: "bg-[hsl(var(--banker-red))]",
    tie: "bg-[hsl(var(--tie-green))]",
  }[cell.winner];

  return (
    <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center p-0.5 relative">
      <div className={cn("w-full h-full rounded-full flex items-center justify-center text-[10px] md:text-xs font-bold text-white shadow-sm", bgColor)}>
        {cell.winner === 'player' ? '閒' : cell.winner === 'banker' ? '莊' : '和'}
        {cell.isPair && <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white border border-black z-20" />}
      </div>
    </div>
  );
}

function BigRoadCell({ cell }: { cell: RoadmapCell }) {
  if (!cell) return <div className="w-3 h-3 md:w-4 md:h-4" />;

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
