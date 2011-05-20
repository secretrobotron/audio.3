import re

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
  contents = contents.replace(script, '<script type="text/javascript">'+script_contents+'</script>')

images = re.findall('<img class="data-image" src=".*" id=".*"/>', contents)
for image in images:
  image_src = re.search('src="(.*)" id', image)
  print ("Found", image_src.group(1))
  image_file = open(image_src.group(1)+'.txt', 'r')
  image_contents = image_file.read()
  image_file.close()
  contents = contents.replace(image, '<img class="data-image" id="'+image_src.group(1)+'" src="'+image_contents+'"/>')

out_file = open('super.html', 'w')
out_file.write(contents)
out_file.close()

print ("Done: super.html")

