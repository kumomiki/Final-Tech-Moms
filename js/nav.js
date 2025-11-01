// js/nav.js
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.getElementById("nav-group");
  const overlay = document.querySelector(".nav-overlay");

  if (!toggle || !menu || !overlay) return;

  const openMenu = () => {
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    // 換成 X
    toggle.innerHTML = '<span class="sr-only">Close menu</span><i class="fa-solid fa-xmark"></i>';
    // 顯示遮罩、鎖捲動
    overlay.hidden = false;
    document.body.classList.add("body-lock");
  };

  const closeMenu = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    // 換回漢堡
    toggle.innerHTML = '<span class="sr-only">Open menu</span><i class="fa-solid fa-bars"></i>';
    // 關閉遮罩、解鎖捲動
    overlay.hidden = true;
    document.body.classList.remove("body-lock");
  };

  const isOpen = () => menu.classList.contains("open");

  // 點擊按鈕切換
  toggle.addEventListener("click", () => {
    isOpen() ? closeMenu() : openMenu();
  });

  // 點遮罩關閉
  overlay.addEventListener("click", closeMenu);

  // 點選單連結後關閉（避免留著）
  menu.addEventListener("click", (e) => {
    const isLink = e.target.closest("a");
    if (isLink) closeMenu();
  });

  // ESC 關閉
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) closeMenu();
  });

  // 視窗放大到桌機時，確保狀態復原
  const mq = window.matchMedia("(min-width: 769px)");
  mq.addEventListener("change", (ev) => {
    if (ev.matches) closeMenu();
  });
});
