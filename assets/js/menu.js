document.addEventListener('DOMContentLoaded', function() {
  // Get the menu container element
  const menuContainer = document.getElementById('#kt_sidebar_menu');

  // Create an array of menu items
  const menuItems = [
    { title: 'Dashboard', link: '/dashboard' },
    { title: 'Messages', link: '/messages' },
    { title: 'Contacts', link: '/contacts' },
    { title: 'Analitics', link: '/analitics', disabled: true },
    { title: 'Profile', link: '/profile', disabled: true },
    { title: 'Settings', link: '/settings', disabled: true }
  ];

  // Get the current path without the trailing slash
  const currentPath = window.location.pathname.replace(/\/$/, '');

  // Iterate over the menu items and create the menu structure
  menuItems.forEach((item, index) => {
    // Create a menu item element
    const menuItem = document.createElement('div');
    menuItem.classList.add('menu-item');

    // Create a menu link element
    const menuLink = document.createElement('a');
    menuLink.classList.add('menu-link');
    menuLink.href = item.link;

    // Create a menu icon element
    const menuIcon = document.createElement('span');
    menuIcon.classList.add('menu-icon');
    // Add the SVG icon code
    menuIcon.innerHTML = `
      <!--begin::Svg Icon | path: icons/duotune/arrows/arr001.svg-->
      <span class="svg-icon svg-icon-5">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.4 11H3C2.4 11 2 11.4 2 12C2 12.6 2.4 13 3 13H14.4V11Z" fill="currentColor" />
          <path opacity="0.3" d="M14.4 20V4L21.7 11.3C22.1 11.7 22.1 12.3 21.7 12.7L14.4 20Z" fill="currentColor" />
        </svg>
      </span>
      <!--end::Svg Icon-->
    `;

    // Create a menu title element
    const menuTitle = document.createElement('span');
    menuTitle.classList.add('menu-title');
    menuTitle.textContent = item.title;

    // Append the menu icon, title, and link to the menu item
    menuLink.appendChild(menuIcon);
    menuLink.appendChild(menuTitle);
    menuItem.appendChild(menuLink);

    // Append the item to the menu container
    menuContainer.appendChild(menuItem);

    // Disable the menu link if specified
    if (item.disabled) {
      menuLink.classList.add('disabled');
      menuLink.removeAttribute('href');
    }

    // Add the "active" class to the active tab
    if (currentPath === item.link) {
      menuLink.classList.add('active');
    }
  });
});
