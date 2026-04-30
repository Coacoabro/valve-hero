import xml.etree.ElementTree as ET
import json
from fingering import fingering

tree = ET.parse("Trumpet.musicxml")
root = tree.getroot()

part = root.find("part")
measures = part.findall("measure")

chart = []

current_time = 0
note_id = 0

for measure in measures:
    measure_num = measure.get("number")
    # print(measure_num)
    notes = measure.findall("note")

    for note in notes:

        if note.find("rest") is not None:
            duration = int(note.find("duration").text)
            current_time += duration
            continue

        note_id += 1
        pitch = note.find("pitch")
        
        step = pitch.find("step").text
        octave = pitch.find("octave").text
        note_name = f"{step}{octave}"

        alter = pitch.find("alter")
        alter_num = int(alter.text) if alter is not None else 0

        note_fing = fingering[note_name][alter_num]

        duration = int(note.find("duration").text) if note.find('grace') is None else 0

        chart.append({
            "id": note_id,
            "measure": measure_num,
            "time": current_time,
            "duration": duration,
            "note": note_name,
            "alter": alter_num,
            "fingering": note_fing

        })

        current_time += duration

with open("dishes.json", "w") as f:
    json.dump(chart, f, indent=2)