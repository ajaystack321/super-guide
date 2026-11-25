const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const statusText = document.getElementById("status");

function updatePreview() {
  preview.innerHTML = editor.innerHTML;
}

function setStatus(message) {
  statusText.textContent = message;
}

function focusEditor() {
  editor.focus();
}

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function validateURL(value, allowMail = false) {
  try {
    const url = new URL(value);
    const protocols = allowMail
      ? ["http:", "https:", "mailto:"]
      : ["http:", "https:"];

    return protocols.includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

// Text formatting
document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    focusEditor();

    const action = button.dataset.action;

    if (action === "h2") {
      document.execCommand("formatBlock", false, "h2");
    } else if (action === "paragraph") {
      document.execCommand("formatBlock", false, "p");
    } else if (action === "ul") {
      document.execCommand("insertUnorderedList");
    } else {
      document.execCommand(action, false, null);
    }

    updatePreview();
  });
});

// Insert hyperlink
document.getElementById("linkBtn").addEventListener("click", () => {
  focusEditor();

  const url = prompt("Enter link URL:");
  if (!url) return;

  const safeUrl = validateURL(url, true);

  if (!safeUrl) {
    alert("Please enter a valid URL.");
    return;
  }

  const selection = window.getSelection();

  if (selection && selection.toString()) {
    document.execCommand("createLink", false, safeUrl);
  } else {
    const label = prompt("Enter link text:", new URL(safeUrl).hostname);

    if (label) {
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${escapeHTML(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`
      );
    }
  }

  updatePreview();
});

// Insert image URL
document.getElementById("imageUrlBtn").addEventListener("click", () => {
  focusEditor();

  const url = prompt("Enter image URL:");
  if (!url) return;

  const safeUrl = validateURL(url);

  if (!safeUrl) {
    alert("Please enter a valid image URL.");
    return;
  }

  document.execCommand("insertImage", false, safeUrl);
  updatePreview();
});

// Upload image
document.getElementById("uploadBtn").addEventListener("click", () => {
  document.getElementById("imageFile").click();
});

document.getElementById("imageFile").addEventListener("change", event => {
  const file = event.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("Image size must be below 5 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {
    focusEditor();

    document.execCommand("insertImage", false, reader.result);

    updatePreview();
    setStatus("Image inserted successfully.");
  };

  reader.readAsDataURL(file);
  event.target.value = "";
});

// Save document
document.getElementById("saveBtn").addEventListener("click", () => {
  try {
    localStorage.setItem(
      "superGuideContent",
      editor.innerHTML
    );

    setStatus("Document saved successfully.");
  } catch {
    alert("Storage full. Please export your HTML.");
  }
});

// Export HTML
document.getElementById("exportBtn").addEventListener("click", () => {
  const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>My Advertisement</title>
<style>
body {
  font-family: Arial, sans-serif;
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  line-height: 1.7;
}
img {
  max-width: 100%;
  height: auto;
}
</style>
</head>
<body>
${editor.innerHTML}
</body>
</html>`;

  const blob = new Blob([fullHTML], {
    type: "text/html"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "my-advertisement.html";

  a.click();

  URL.revokeObjectURL(url);

  setStatus("HTML exported successfully.");
});

// Clear document
document.getElementById("clearBtn").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear the document?")) {
    editor.innerHTML = "<p>Start typing your content here...</p>";

    updatePreview();
    setStatus("Document cleared.");
  }
});

// Load saved document
try {
  const saved = localStorage.getItem("superGuideContent");

  if (saved) {
    editor.innerHTML = saved;
  }
} catch {
  setStatus("Could not access browser storage.");
}

// Live preview
editor.addEventListener("input", updatePreview);

updatePreview();
