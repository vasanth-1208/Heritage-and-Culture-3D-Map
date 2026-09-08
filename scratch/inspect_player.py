import re

with open('scratch_pano2vr_player.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

sound_matches = sorted(list(set(re.findall(r'([a-zA-Z0-9_]*[Ss]ound[a-zA-Z0-9_]*)', text))))
print('Sound tokens in player (%d):' % len(sound_matches))
print(sound_matches[:30])

audio_matches = sorted(list(set(re.findall(r'([a-zA-Z0-9_]*[Aa]udio[a-zA-Z0-9_]*)', text))))
print('Audio tokens in player (%d):' % len(audio_matches))
print(audio_matches[:30])
