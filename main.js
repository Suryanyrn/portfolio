/* =========================================
   1. THREE.JS BACKGROUND ANIMATION
   ========================================= */
const canvas = document.querySelector("#webgl-canvas");

// Check if canvas exists before running Three.js to prevent errors
if (canvas) {
  const scene = new THREE.Scene();

  // Camera setup
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 150;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // --- PARTICLES CONFIG ---
  const particleCount = 100;
  const connectionDistance = 25;
  const movementSpeed = 0.3;

  const particlesData = [];
  const geometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);

  // Initialize Particles
  for (let i = 0; i < particleCount; i++) {
    const x = Math.random() * 200 - 100;
    const y = Math.random() * 200 - 100;
    const z = Math.random() * 200 - 100;

    particlePositions[i * 3] = x;
    particlePositions[i * 3 + 1] = y;
    particlePositions[i * 3 + 2] = z;

    particlesData.push({
      velocity: new THREE.Vector3(
        -1 + Math.random() * 2,
        -1 + Math.random() * 2,
        -1 + Math.random() * 2
      ),
    });
  }

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(particlePositions, 3)
  );

  // Material
  const pMaterial = new THREE.PointsMaterial({
    color: 0x64ffda, // Cyan/Teal accent color
    size: 2,
    blending: THREE.AdditiveBlending,
    transparent: true,
    sizeAttenuation: true,
  });

  const particleSystem = new THREE.Points(geometry, pMaterial);
  scene.add(particleSystem);

  // Lines
  const lineGeometry = new THREE.BufferGeometry();
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x64ffda,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
  });
  const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(linesMesh);

  // Mouse Interaction
  let mouseX = 0;
  let mouseY = 0;
  document.addEventListener("mousemove", (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation Loop
  const animate = function () {
    const linePositions = [];

    for (let i = 0; i < particleCount; i++) {
      const pData = particlesData[i];

      // Update Position
      particlePositions[i * 3] += pData.velocity.x * movementSpeed;
      particlePositions[i * 3 + 1] += pData.velocity.y * movementSpeed;
      particlePositions[i * 3 + 2] += pData.velocity.z * movementSpeed;

      // Bounce off walls
      if (particlePositions[i * 3] < -100 || particlePositions[i * 3] > 100)
        pData.velocity.x *= -1;
      if (
        particlePositions[i * 3 + 1] < -100 ||
        particlePositions[i * 3 + 1] > 100
      )
        pData.velocity.y *= -1;
      if (
        particlePositions[i * 3 + 2] < -100 ||
        particlePositions[i * 3 + 2] > 100
      )
        pData.velocity.z *= -1;

      // Connections
      for (let j = i + 1; j < particleCount; j++) {
        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < connectionDistance) {
          linePositions.push(
            particlePositions[i * 3],
            particlePositions[i * 3 + 1],
            particlePositions[i * 3 + 2],
            particlePositions[j * 3],
            particlePositions[j * 3 + 1],
            particlePositions[j * 3 + 2]
          );
        }
      }
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(linePositions, 3)
    );

    // Rotate Scene
    const time = Date.now() * 0.0005;
    scene.rotation.y = time * 0.1 + mouseX * 0.1;
    scene.rotation.x = mouseY * 0.1;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

/* =========================================
      2. PAGE ANIMATIONS (Fade In)
      ========================================= */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

/* =========================================
      3. 3D TILT EFFECT FOR CARDS
      ========================================= */
const cards = document.querySelectorAll(".project-card");

cards.forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5; // Max rotation deg
    const rotateY = ((x - centerX) / centerX) * 5;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) scale(1)";
  });
});

/* =========================================
      4. CHATBOT LOGIC (API BASED)
      ========================================= */

// 🔴 CONFIGURATION: PASTE YOUR API KEY HERE
const GROQ_API_KEY = "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";

const SYSTEM_PROMPT = `
   You are an advanced AI assistant for Suryanarayanan R's professional portfolio website.
   Your tone is professional, enthusiastic, and concise.
   
   HERE IS SURYANARAYANAN'S RESUME DATA:
   - **Name:** Suryanarayanan R
   - **Role:** Data Scientist | Machine Learning Engineer | Full Stack Developer
   - **Education:** B.E. Mechanical Engineering, Government College of Engineering, Tirunelveli (2023-2027). Top academic rank for 3 semesters.
   - **Contact:** suryanryn0201@gmail.com | +91 6385300231
   - **Experience:**
     1. **Data Analyst Intern @ Bosch** (July-Aug 2025): Analyzed production data, used Python/Pandas for Industry 4.0, built Power BI dashboards.
     2. **Software Engineer @ Robot Project** (Aug-Sept 2025): Built UI/UX & Django backend, integrated ROS/Lidar.
   - **Key Projects:**
     1. **Pneumonia Detection:** InceptionV3 Deep Learning model, 95% accuracy, Grad-CAM validation.
     2. **RAG Business Chatbot:** Used LangChain, Pinecone, Open Router LLMs for querying 1000+ custom business sentences.
     3. **AskAbhi Technologies:** Secure data system, optimized queries (20% faster retrieval), reduced bot spam by 90%.
     4. **Student Performance Analysis:** Analyzed 3000+ student records for insights.
     5. **Movie Recommender:** NLP & Cosine Similarity based.
   - **Technical Skills:**
     - Languages: Python, Java, C++, JavaScript, C.
     - AI/ML: TensorFlow, Scikit-learn, Pandas, NumPy, NLP, Deep Learning.
     - Web: Django, HTML, CSS, React.
     - Tools: Docker, Git, MySQL, MongoDB, PostgreSQL, VS Code.
   - **Achievements:** Solved 250+ LeetCode problems. Class Representative & Placement Coordinator.
   
   RULES:
   1. If asked about hiring/contact, strictly provide the email and phone.
   2. Keep answers short (under 3 sentences) unless asked for details.
   3. You are representing Surya, be humble but confident about his skills.
   `;

const chatToggle = document.getElementById("chat-toggle-btn");
const chatWidget = document.getElementById("chat-widget");
const closeChat = document.getElementById("close-chat");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const chatBody = document.getElementById("chat-body");
const badge = document.querySelector(".badge");

// Toggle Widget
if (chatToggle && chatWidget) {
  chatToggle.addEventListener("click", () => {
    chatWidget.classList.add("active");
    if (badge) badge.style.display = "none";
    if (chatInput) chatInput.focus();
  });
}

if (closeChat) {
  closeChat.addEventListener("click", () => {
    chatWidget.classList.remove("active");
  });
}

// Helper for suggestion chips
window.fillInput = function (text) {
  if (chatInput) {
    chatInput.value = text;
    handleUserMessage();
  }
};

async function handleUserMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  // Add User Message
  appendMessage(text, "user-message");
  chatInput.value = "";
  disableInput(true);

  // Add Loading State
  const loadingId = appendMessage("Thinking...", "bot-message");
  const loadingElem = document.getElementById(loadingId);

  try {
    const aiResponse = await callGroqAPI(text);
    if (loadingElem) loadingElem.remove();
    appendMessage(aiResponse, "bot-message");
  } catch (error) {
    console.error(error);
    if (loadingElem) loadingElem.remove();
    appendMessage(
      `Sorry, I encountered an issue: ${error.message}`,
      "bot-message"
    );
  } finally {
    disableInput(false);
  }
}

async function callGroqAPI(userMessage) {
  if (!GROQ_API_KEY || GROQ_API_KEY.includes("PASTE_YOUR_API_KEY")) {
    throw new Error(
      "API Key is missing. Please edit script.js and add your Key."
    );
  }

  const url = "https://api.groq.com/openai/v1/chat/completions";

  const body = {
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: 200,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMessage = data.error ? data.error.message : response.statusText;
    throw new Error(errMessage);
  }

  return data.choices[0].message.content;
}

function appendMessage(text, className) {
  const div = document.createElement("div");
  div.classList.add("message", className);
  // Simple markdown parsing for bold text
  div.innerHTML = text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\n/g, "<br>");
  div.id = "msg-" + Date.now();
  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
  return div.id;
}

function disableInput(state) {
  if (!chatInput || !sendBtn) return;

  chatInput.disabled = state;
  sendBtn.disabled = state;
  if (state) {
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  } else {
    sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    chatInput.focus();
  }
}

// Event Listeners for Chat
if (sendBtn) sendBtn.addEventListener("click", handleUserMessage);
if (chatInput)
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleUserMessage();
  });
