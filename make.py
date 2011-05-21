import re
import base64

in_file = open('index.html', 'r')
contents = in_file.read()
in_file.close();

print ("Compiling...")

scripts = re.findall('<script src=".*"[\ \w]*></script>', contents)
for script in scripts:
  script_src = re.search('src="([.-_\w]*)"', script)
  print ("Found", script_src.group(1))
  script_file = open(script_src.group(1), 'r')
  script_contents = script_file.read()
  script_file.close()
  contents = contents.replace(script, '<script type="text/javascript">\n'+script_contents+'\n</script>')

images = re.findall('<img class="data-image" src=".*" id=".*"/>', contents)
for image in images:
  image_src = re.search('src="(.*)" id', image)
  print ("Found", image_src.group(1))
  image_file = open(image_src.group(1)+'.txt', 'r')
  image_contents = image_file.read()
  image_file.close()
  contents = contents.replace(image, '<img class="data-image" id="'+image_src.group(1)+'" src="'+image_contents+'"/>')

shaders = re.findall('<script id=".*" src=".*" type="x-shader/x-.*"></script>', contents)
for shader in shaders:
  shader_src = re.search('id="(.*)" src="(.*)" type="(x-shader/x-.*)"', shader)
  print ("Found", shader_src.group(2))
  shader_file = open(shader_src.group(2), 'r')
  shader_contents = shader_file.read()
  shader_file.close()
  contents = contents.replace(shader, '<script id="'+shader_src.group(1)+'" type="'+shader_src.group(3)+'">\n'+shader_contents+'\n</script>')

  swaps = re.findall('shader_vertex:\ ?[\'|"]'+shader_src.group(2)+'[\'|"]', contents)
  for swap in swaps:
    contents = contents.replace(swap, 'shader_vertex: "'+shader_src.group(1)+'"')
  swaps = re.findall('shader_fragment:\ ?[\'|"]'+shader_src.group(2)+'[\'|"]', contents)
  for swap in swaps:
    contents = contents.replace(swap, 'shader_fragment: "'+shader_src.group(1)+'"')

audio_file = open('mod.mod', 'rb')
audio_data = audio_file.read()
audio_str = base64.encodestring(audio_data)
audio_file.close()
contents = contents.replace('audioData;', 'audioData = "'+(str(audio_str)[2:-1].replace("\\n",''))+'";')

out_file = open('super.html', 'w')
out_file.write(contents)
out_file.close()

print ("Done: super.html")

