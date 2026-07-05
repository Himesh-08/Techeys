document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Preloader Screen ---
  const preloader = document.getElementById("preloader");
  const preloaderBar = document.getElementById("preloader-bar");
  
  if (preloader && preloaderBar) {
    // Animate progress bar width first
    setTimeout(() => {
      preloaderBar.style.width = "100%";
    }, 100);
    
    // Fade out and remove loading panel
    setTimeout(() => {
      preloader.style.opacity = "0";
      setTimeout(() => {
        preloader.style.display = "none";
      }, 800);
    }, 1000);
  }

  // --- 2. Custom Cursor DOT & Glow Follower ---
  const cursorDot = document.getElementById("custom-cursor");
  const cursorBlob = document.getElementById("custom-cursor-blur");
  
  if (cursorDot && cursorBlob) {
    let mouseX = -100;
    let mouseY = -100;
    let dotX = -100;
    let dotY = -100;
    let blobX = -100;
    let blobY = -100;

    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Custom cursor lerp tick loop
    function updateCursor() {
      // DOT follow cursor instantly
      dotX += (mouseX - dotX) * 0.3;
      dotY += (mouseY - dotY) * 0.3;
      
      // BLOB follows with more dampening for smooth glide
      blobX += (mouseX - blobX) * 0.08;
      blobY += (mouseY - blobY) * 0.08;
      
      cursorDot.style.left = `${dotX}px`;
      cursorDot.style.top = `${dotY}px`;
      
      cursorBlob.style.left = `${blobX}px`;
      cursorBlob.style.top = `${blobY}px`;
      
      requestAnimationFrame(updateCursor);
    }
    requestAnimationFrame(updateCursor);

    // Dynamic query to bind hovers to existing and new items
    function bindCursorHovers() {
      const hoverTargets = document.querySelectorAll('a, button, [data-cursor="true"], input, textarea, select');
      hoverTargets.forEach((target) => {
        // Prevent duplicate bindings
        if (target.dataset.cursorBound) return;
        target.dataset.cursorBound = "true";
        
        target.addEventListener("mouseenter", () => {
          cursorDot.classList.add("hover-active-cursor");
          cursorBlob.classList.add("hover-active-blob");
        });
        target.addEventListener("mouseleave", () => {
          cursorDot.classList.remove("hover-active-cursor");
          cursorBlob.classList.remove("hover-active-blob");
        });
      });
    }
    bindCursorHovers();
    // Re-run periodically to cover dynamic content
    setInterval(bindCursorHovers, 1500);
  }

  // --- 3. Scroll Reveal Animation ---
  const revealElements = document.querySelectorAll(".reveal-item");
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target); // Reveal only once
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
  );

  revealElements.forEach((el) => {
    el.style.opacity = "";
    el.style.transform = "";
    revealObserver.observe(el);
  });

  // --- 4. Sticky Header Glassmorphism & Top Progress Bar ---
  const header = document.querySelector("header");
  const progressBar = document.getElementById("scroll-progress");

  window.addEventListener("scroll", () => {
    // Header scrolled state
    if (header) {
      if (window.scrollY > 20) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }

    // Scroll progress bar
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight > 0) {
        const scrolledRatio = window.scrollY / docHeight;
        progressBar.style.transform = `scaleX(${scrolledRatio})`;
      }
    }
  });

  // --- 5. Statistics Counter Animation ---
  const stats = document.querySelectorAll(".stat-number");
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  stats.forEach((stat) => {
    statsObserver.observe(stat);
  });

  function animateCounter(element) {
    const target = parseInt(element.getAttribute("data-target"), 10);
    const suffix = element.getAttribute("data-suffix") || "";
    let count = 0;
    const duration = 1500; // Total count duration in ms
    const frameRate = 1000 / 60; // 60 frames per second
    const increment = target / (duration / frameRate);
    
    const counterTimer = setInterval(() => {
      count += increment;
      if (count >= target) {
        clearInterval(counterTimer);
        element.textContent = `${target}${suffix}`;
      } else {
        element.textContent = `${Math.floor(count)}${suffix}`;
      }
    }, frameRate);
  }

  // --- 6. Interactive Accordion FAQ ---
  const faqButtons = document.querySelectorAll(".faq-btn");
  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const faqItem = btn.closest(".faq-item");
      const answer = faqItem.querySelector(".faq-answer");
      const isActive = faqItem.classList.contains("active");
      
      // Close all other FAQ items
      document.querySelectorAll(".faq-item").forEach((item) => {
        item.classList.remove("active");
        item.querySelector(".faq-answer").style.maxHeight = "0px";
      });

      if (!isActive) {
        faqItem.classList.add("active");
        answer.style.maxHeight = `${answer.scrollHeight}px`;
      }
    });
  });

  // --- 7. Mobile Hamburger Menu Toggler ---
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navMenu = document.getElementById("nav-menu");

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("mobile-menu-active");
    });

    // Close menu when navigation link is clicked
    const navLinks = navMenu.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("mobile-menu-active");
      });
    });
  }

  // --- 8. Contact Inquiry Form Submissions & Express API ---
  const contactForm = document.querySelector("#contact form");
  


  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Get inputs safely using their visual order index
      const inputs = contactForm.querySelectorAll("input");
      const name = inputs[0] ? inputs[0].value.trim() : "";
      const email = inputs[1] ? inputs[1].value.trim() : "";
      const business = inputs[2] ? inputs[2].value.trim() : "";
      const industry = inputs[3] ? inputs[3].value.trim() : "";
      const message = contactForm.querySelector("textarea")?.value.trim() || "";
      
      // Basic validation
      if (!name || !email) {
        alert("Please provide at least a name and contact email address.");
        return;
      }
      
      // Send real data POST request to Express backend
      fetch('/api/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          business,
          industry,
          
          message
        })
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Server returned error status');
        }
        return response.json();
      })
      .then(data => {
        if (data.success) {
          // Create and Show Success Alert Modal Element
          const successModal = document.createElement("div");
          successModal.style.position = "fixed";
          successModal.style.inset = "0";
          successModal.style.zIndex = "1000";
          successModal.style.display = "grid";
          successModal.style.placeItems = "center";
          successModal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
          successModal.style.backdropFilter = "blur(12px)";
          successModal.style.opacity = "0";
          successModal.style.transition = "opacity 0.4s ease";
          
          successModal.innerHTML = `
            <div class="grad-border" style="background: #0B0B0B; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 1.5rem; padding: 2.5rem; max-width: 500px; width: 90%; text-align: center; box-shadow: 0 25px 50px -12px rgba(230, 57, 70, 0.25);">
              <div class="h-16 w-16 mx-auto rounded-full bg-[#E63946]/10 border border-[#E63946]/30 grid place-items-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E63946" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
              <h3 class="font-display text-2xl md:text-3xl text-white mb-3">Proposal Received</h3>
              <p class="text-white/60 mb-6 text-sm md:text-base leading-relaxed">Thank you, <strong>${name}</strong>. Your project brief has been successfully submitted to our design board. <br/><br/>A director from CrimsonStack will review your requirements and reach out to you within 24 business hours to schedule a discovery call.</p>
              <button id="close-modal-btn" class="inline-flex items-center justify-center font-medium transition-colors bg-[#E63946] hover:bg-[#E63946]/90 text-white rounded-full h-11 px-8 text-sm glow-red-sm w-full">Return to Home</button>
            </div>
          `;
          
          document.body.appendChild(successModal);
          
          setTimeout(() => {
            successModal.style.opacity = "1";
          }, 50);
          
          const closeModalBtn = successModal.querySelector("#close-modal-btn");
          closeModalBtn.addEventListener("click", () => {
            successModal.style.opacity = "0";
            setTimeout(() => {
              successModal.remove();
            }, 400);
            
            // Reset form inputs
            contactForm.reset();
            selectedBudget = "";
          });
        } else {
          alert('Backend error: ' + data.error);
        }
      })
      .catch(error => {
        console.error('Submission Error:', error);
        alert('Could not contact the server backend. Make sure the backend server.js is running!');
      });
    });
  }

  // --- 9. Newsletter Form Submission ---
  function bindNewsletter() {
    const newsletterForm = Array.from(document.forms).find(form => {
      const btn = form.querySelector("button");
      return btn && btn.textContent.trim() === "Subscribe";
    });

    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const emailInput = newsletterForm.querySelector("input[type='email']");
        const email = emailInput ? emailInput.value.trim() : "";
        
        if (!email) {
          alert("Please enter a valid email address.");
          return;
        }
        
        fetch('/api/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // Replace form with confirmation message inline
            const originalHtml = newsletterForm.innerHTML;
            newsletterForm.innerHTML = `<span class="text-sm text-[#E63946] font-medium font-display animate-pulse">✓ Subscribed successfully!</span>`;
            setTimeout(() => {
              newsletterForm.innerHTML = originalHtml;
              // Re-bind submit listener since HTML was overwritten
              bindNewsletter();
            }, 3000);
          } else {
            alert("Error: " + data.error);
          }
        })
        .catch(error => {
          console.error("Subscription Error:", error);
          alert("Could not contact the server backend. Make sure server.js is running!");
        });
      });
    }
  }
  bindNewsletter();

  // --- 10. Google Auth Integration ---
  const googleClientId = "1047929681347-kmo8mm3imocuou1iqaveae0d2kcjb7ph.apps.googleusercontent.com"; // REPLACE WITH YOUR ACTUAL GOOGLE CLIENT ID

  function decodeJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error("JWT Decode error:", e);
      return null;
    }
  }

  function handleCredentialResponse(response) {
    const payload = decodeJwt(response.credential);
    if (!payload) return;
    
    const user = {
      name: payload.name,
      email: payload.email,
      avatar: payload.picture
    };
    
    // Save to LocalStorage to persist login state across page reloads
    localStorage.setItem("google_user", JSON.stringify(user));
    showLoggedInState(user);
    
    // Send user registration details to express backend
    fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    .then(res => res.json())
    .then(data => console.log("User successfully synchronized with backend:", data))
    .catch(err => console.error("Sync error:", err));
  }

  function showLoggedInState(user) {
    const loginBtn = document.getElementById("google-login-btn");
    const profileBadge = document.getElementById("user-profile-badge");
    const avatarImg = document.getElementById("user-avatar");
    const nameSpan = document.getElementById("user-name");
    
    if (profileBadge && loginBtn) {
      if (avatarImg) avatarImg.src = user.avatar;
      if (nameSpan) nameSpan.textContent = user.name.split(' ')[0]; // Show first name
      
      loginBtn.style.display = "none";
      profileBadge.style.display = "flex";
    }
  }

  function showLoggedOutState() {
    const loginBtn = document.getElementById("google-login-btn");
    const profileBadge = document.getElementById("user-profile-badge");
    
    if (profileBadge && loginBtn) {
      loginBtn.style.display = "block";
      profileBadge.style.display = "none";
    }
  }

  // Bind Logout Action
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("google_user");
      showLoggedOutState();
      google.accounts.id.disableAutoSelect();
    });
  }

  // Load Saved Login State
  const savedUser = localStorage.getItem("google_user");
  if (savedUser) {
    showLoggedInState(JSON.parse(savedUser));
  }

  // Initialize Google Identity Services
  if (typeof google !== 'undefined') {
    google.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleCredentialResponse,
      auto_select: true
    });
    
    const loginBtnElement = document.getElementById("google-login-btn");
    if (loginBtnElement) {
      google.accounts.id.renderButton(
        loginBtnElement,
        { theme: "dark", size: "medium", shape: "pill" }
      );
    }
    
    // Display One Tap Prompt (if not already logged in)
    if (!savedUser) {
      google.accounts.id.prompt();
    }
  }

});