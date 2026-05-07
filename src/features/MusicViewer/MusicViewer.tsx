"use client";

import { useEffect, useRef, useState } from "react";
import { OpenSheetMusicDisplay, IOSMDOptions } from "opensheetmusicdisplay";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export default function MusicViewer() {

    const containerRef = useRef<HTMLDivElement>(null);
    const osmdRef = useRef<OpenSheetMusicDisplay | null>(null);
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {

        if (containerRef.current && !osmdRef.current){
            osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
                autoResize: true,
                drawTitle: true,
                followCursor: true,
            });

            osmdRef.current.load("/Trumpet.musicxml").then(() => {
                osmdRef.current?.render();
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

    return (
        <div className="space-y-4 justify-center flex">
            <div className="absolute right-25 top-200">
                <Button onClick={backward}>
                    <ChevronLeft size={24} />
                </Button>
                <Button onClick={reset}>
                    <RotateCcw />
                </Button>
                <Button onClick={forward}>
                    <ChevronRight size={24} />
                </Button>
            </div>
            
            <div className="border rounded-xl relative max-w-5xl" >
                <div 
                    ref={cursorRef}
                    className="absolute w-1 h-4 bg-red-500 z-50 transition-transform duration-200 left-0 top-0"
                />
                <div ref={containerRef} />
            </div>
            
        </div>
    );
}