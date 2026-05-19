// Load and randomize testimonios
(async function() {
  try {
    const response = await fetch('testimonios.json');
    const allTestimonios = await response.json();
    
    // Shuffle array
    const shuffled = allTestimonios.sort(() => Math.random() - 0.5);
    
    // Take first 10 (or all if less than 10)
    const selected = shuffled.slice(0, 10);
    
    // Generate random positions for desktop
    const positions = [
      { left: 76, top: 10, rotate: 8 },
      { left: 1, top: 8, rotate: -6 },
      { left: 52, top: 3, rotate: 5 },
      { left: 25, top: 2, rotate: -2 },
      { left: 71, top: 38, rotate: 7 },
      { left: 5, top: 50, rotate: -8 },
      { left: 36, top: 46, rotate: 3 },
      { left: 48, top: 30, rotate: -4 },
      { left: 14, top: 45, rotate: 6 },
      { left: 62, top: 25, rotate: -5 }
    ];
    
    // Color palette
    const cardColors = [
      '#ffffff',
      '#f0ffd4',
      '#fff8ee',
      '#f5f0ff',
      '#eef8ff',
      '#fff3f0',
      '#f0fff8'
    ];

    // Render desktop cards
    const cardStage = document.getElementById('card-stage');
    selected.forEach((t, i) => {
      const pos = positions[i];
      const card = document.createElement('div');
      card.className = 't-card';
      card.style.left = `${pos.left}%`;
      card.style.top = `${pos.top}%`;
      card.style.transform = `rotate(${pos.rotate}deg)`;
      card.style.background =
        t.background || cardColors[i % cardColors.length];
      
      const roleText = t.brand ? `${t.role} · ${t.brand}` : t.role;
      
      card.innerHTML = `
        <div class="t-tag">opinión</div>
        <p class="t-quote">"${t.quote}"</p>
        <div><p class="t-name">${t.name}</p><p class="t-role">${roleText}</p></div>
      `;
      cardStage.appendChild(card);
    });
    
    // Render mobile cards
    const mobileContainer = document.querySelector('.testimonios-mobile');
    selected.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = 't-card';
      card.style.background =
        t.background || cardColors[i % cardColors.length];
      
      const roleText = t.brand ? `${t.role} · ${t.brand}` : t.role;
      const quoteText = t.quoteMobile || t.quote;
      
      card.innerHTML = `
        <div class="t-tag">opinión</div>
        <p class="t-quote">"${quoteText}"</p>
        <div><p class="t-name">${t.name}</p><p class="t-role">${roleText}</p></div>
      `;
      mobileContainer.appendChild(card);
    });
    
    // Reinitialize draggable functionality for desktop cards
    if (window.innerWidth > 600) {
      const cards = document.querySelectorAll('#card-stage .t-card');
      cards.forEach(card => {
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;
        
        card.addEventListener('mousedown', e => {
          isDragging = true;
          startX = e.clientX;
          startY = e.clientY;
          const rect = card.getBoundingClientRect();
          const parent = card.parentElement.getBoundingClientRect();
          initialLeft = ((rect.left - parent.left) / parent.width) * 100;
          initialTop = ((rect.top - parent.top) / parent.height) * 100;
          card.style.cursor = 'grabbing';
          card.style.zIndex = 100;
        });
        
        document.addEventListener('mousemove', e => {
          if (!isDragging) return;
          const parent = card.parentElement.getBoundingClientRect();
          const dx = ((e.clientX - startX) / parent.width) * 100;
          const dy = ((e.clientY - startY) / parent.height) * 100;
          card.style.left = `${initialLeft + dx}%`;
          card.style.top = `${initialTop + dy}%`;
        });
        
        document.addEventListener('mouseup', () => {
          if (isDragging) {
            isDragging = false;
            card.style.cursor = 'grab';
          }
        });
      });
    }
    
  } catch (error) {
    console.error('Error loading testimonios:', error);
  }
})();