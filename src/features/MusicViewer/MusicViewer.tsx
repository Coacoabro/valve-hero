"use client";

import { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay, IOSMDOptions } from "opensheetmusicdisplay";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";

export default function MusicViewer() {

    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const playbackRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [bpm, setBPM] = useState(0)

    useEffect(() => {

        if (containerRef.current && !osmdRef.current){
            osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
                autoResize: true,
                drawTitle: true,
                followCursor: true,
            });

            osmdRef.current.load("/Trumpet.musicxml").then(() => {
                osmdRef.current?.render();
                if (!bpm) {
                    setBPM(osmdRef.current?.Sheet.SourceMeasures[0].TempoInBPM || 100)
                }
                updateCursor(osmdRef.current)
            });
        };

        

    }, []);

    const updateCursor = (osmd) => {
        const gNote = osmd.cursor.GNotesUnderCursor()

        if(gNote?.length > 0) {
            const {x, y} = gNote[0].PositionAndShape.AbsolutePosition;
            const scale = 10 * osmd.Zoom
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate(${x*scale}px, ${y*scale}px)`
            }
        }
    }

    const reset = () => {
        const osmd = osmdRef.current
        if (!osmd || !osmd.cursor) return

        osmd.cursor.reset()

        updateCursor(osmd)
    }

    const forward = () => {
        const osmd = osmdRef.current
        if (!osmd || !osmd.cursor) return

        osmd.cursor.next()

        updateCursor(osmd)
    }

    const backward = () => {
        const osmd = osmdRef.current
        if (!osmd || !osmd.cursor) return

        osmd.cursor.previous()

        updateCursor(osmd)
    }

    const play = () => {
        if (isPlaying) return;
        
        setIsPlaying(true)
    
        const playNextNote = () => {
            const osmd = osmdRef.current
            if(!osmd || !osmd.cursor) return

            const currentEntry = osmd.cursor.Iterator.CurrentVoiceEntries[0]

            if(!currentEntry) {
                osmd.cursor.next()
                playNextNote()
                return
            }

            const firstNote = currentEntry.Notes[0]

            let delay = 0
            const msPerBeat = (60000 / bpm)

            if (firstNote.IsGraceNote) {
                
                const secondNote = osmd.cursor.Iterator.CurrentVoiceEntries[1].Notes[0]
                delay = msPerBeat * (secondNote.Length.RealValue * 4)
            } else {
                delay = msPerBeat * (firstNote.Length.RealValue * 4)
            }

            playbackRef.current = setTimeout(() => {
                osmd.cursor.next()
                updateCursor(osmd)
                if(osmd.cursor.Iterator.EndReached) {
                    setIsPlaying(false)
                } else {
                    playNextNote()
                }
            }, delay)
        }

        playNextNote()
    }

    const pause = () => {
        if (!isPlaying) return
        setIsPlaying(false)

        if (playbackRef.current) {
            clearInterval(playbackRef.current)
            playbackRef.current = null
        }
    }

    return (
        <div className="space-y-4">
            
            <div className="absolute right-25 top-100">
                <div>
                    <label>Tempo: {bpm}BPM</label>
                    <input
                        type="range"
                        min="20"
                        max="240"
                        value={bpm}
                        onChange={(e) => {
                            setBPM(parseInt(e.target.value, 10))
                        }}
                    />
                </div>
                <div>
                    <Button onClick={backward}>
                        <ChevronLeft size={24} />
                    </Button>
                    <Button onClick={reset}>
                        <RotateCcw />
                    </Button>
                    {isPlaying ? (
                        <Button onClick={pause}>
                            <Pause />
                        </Button>
                    ) : (
                        <Button onClick={play}>
                            <Play />
                        </Button>
                    )}
                    <Button onClick={forward}>
                        <ChevronRight size={24} />
                    </Button>
                </div>
                
            </div>
            
            <div className="border rounded-xl relative max-w-5xl mx-auto" >
                <div 
                    ref={cursorRef}
                    className="absolute w-1 h-4 bg-red-500 z-50 transition-transform duration-200 left-0 top-0"
                />
                <div ref={containerRef} />
            </div>
            
        </div>
    );
}