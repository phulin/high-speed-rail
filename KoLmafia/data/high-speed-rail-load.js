fetch("/high-speed-rail/index.html")
  .then((resp) => resp.text())
  .then((text) => {
    const existingScripts = new Set(
      document.body.getElementsByTagName("script"),
    );
    const form = document.getElementById("fml");
    if (form) {
      form.style.display = "none";
      document.querySelector("#amodeform").style.display = "none";
      for (const br of document.querySelectorAll("#amodeform ~ br")) {
        br.style.display = "none";
      }
      document.querySelector("#amode").parentNode.style.display = "none";
      form.insertAdjacentHTML("afterend", text);
    }
    for (const script of document.body.getElementsByTagName("script")) {
      if (existingScripts.has(script)) continue;
      const newScript = document.createElement("script");
      if (script.src) newScript.src = script.src;
      if (script.innerHTML) newScript.innerHTML = script.innerHTML;
      if (script.type) newScript.type = script.type;
      script.parentNode.insertBefore(newScript, script);
      script.parentNode.removeChild(script);
    }
  });
