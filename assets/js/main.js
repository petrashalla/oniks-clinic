Fancybox.bind("[data-fancybox]", {
	// Your custom options
});

// animation
const animationItems = document.querySelectorAll(".animation-item");
if (animationItems.length > 0) {
	function onEntry(e) {
		e.forEach((e) => {
			e.isIntersecting && e.target.classList.add("animation-active");
		});
	}
	let options = {
			threshold: [0.5],
		},
		observer = new IntersectionObserver(onEntry, options);
	for (let e of animationItems) observer.observe(e);
}
// end animation

let scrollWidthFunc = () => {
	let scrollWidth = window.innerWidth - document.body.clientWidth;
	document.querySelector("html").style.paddingRight = scrollWidth + "px";
	//document.querySelector('header').style.paddingRight = scrollWidth + 'px';
};

document.querySelectorAll(".scroll-top").forEach((button) => {
	button.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
});

document.addEventListener("DOMContentLoaded", function () {
	/* Шапка и меню */
	const headers = document.querySelectorAll(".header");
	if (headers.length) {
		const desktop = window.matchMedia("(min-width: 1024px)");
		headers.forEach((header, index) => {
			const frame = header.querySelector(".header__frame");
			const nav = header.querySelector(".header__nav");
			const burger = header.querySelector(".header__burger");
			const backdrop = header.querySelector(".header__backdrop");
			const primary = header.querySelector(".header__primary");

			if (!frame || !nav || !burger || !backdrop || !primary) return;

			const fixed = index === 0;
			const primaryItems = [...primary.children];
			const mobileItems = [...primaryItems.filter((item) => item.classList.contains("header__item--first")), ...primaryItems.filter((item) => !item.classList.contains("header__item--first"))];

			let active = null;
			let closeTimer;
			let scrollFrame;

			function setSectionState(section, open) {
				section.item.classList.toggle("header__item--open", open);
				section.dropdown.inert = !open;
				section.button.title = (open ? "Свернуть" : "Раскрыть") + " подменю «" + section.label + "»";
			}

			function setActive(next) {
				clearTimeout(closeTimer);
				if (active === next) return;

				const previous = active;
				active = next;
				if (previous) setSectionState(previous, false);
				if (active) setSectionState(active, true);

				header.classList.toggle("header--dropdown-open", desktop.matches && Boolean(active));
			}

			function setMenu(open) {
				header.classList.toggle("header--menu-open", open);
				nav.inert = !desktop.matches && !open;
				burger.title = open ? "Закрыть меню" : "Открыть меню";
				document.documentElement.classList.toggle("burger-lock", Boolean(document.querySelector(".header--menu-open")));
			}

			function updatePosition() {
				scrollFrame = 0;
				const compact = fixed && desktop.matches && header.getBoundingClientRect().bottom <= 0;
				header.classList.toggle("header--compact", compact);

				const edge = compact ? frame.offsetHeight : frame.getBoundingClientRect().bottom;
				header.style.setProperty("--header-edge", Math.max(0, edge) + "px");
			}

			function measure() {
				if (!header.classList.contains("header--compact")) {
					header.style.setProperty("--header-height", frame.offsetHeight + "px");
				}

				updatePosition();
			}

			function updateLayout() {
				setActive(null);
				setMenu(false);
				primary.append(...(desktop.matches ? primaryItems : mobileItems));
				header.classList.remove("header--compact");
				measure();
			}

			nav.querySelectorAll(".header__toggle").forEach((button) => {
				const item = button.closest(".header__item");
				const link = item?.querySelector(".header__entry > .header__navlink");
				const dropdown = item?.querySelector(".header__dropdown");
				if (!link || !dropdown) return;

				const section = { item, button, dropdown, label: link.textContent.trim() };

				button.addEventListener("click", () => {
					setActive(active === section ? null : section);
				});

				item.addEventListener("pointerenter", (event) => {
					if (desktop.matches && event.pointerType === "mouse") setActive(section);
				});

				item.addEventListener("pointerleave", (event) => {
					if (!desktop.matches || event.pointerType !== "mouse" || active !== section) return;

					clearTimeout(closeTimer);
					closeTimer = setTimeout(() => {
						if (!dropdown.contains(document.activeElement)) setActive(null);
					}, 220);
				});

				item.addEventListener("focusout", (event) => {
					if (desktop.matches && active === section && !item.contains(event.relatedTarget) && !item.matches(":hover")) {
						setActive(null);
					}
				});
			});

			burger.addEventListener("click", () => {
				setMenu(!header.classList.contains("header--menu-open"));
			});

			backdrop.addEventListener("click", () => setActive(null));

			document.addEventListener("click", (event) => {
				if (header.contains(event.target)) return;
				setActive(null);

				if (header.classList.contains("header--menu-open")) setMenu(false);
			});

			document.addEventListener("keydown", (event) => {
				if (event.key !== "Escape") return;

				if (header.classList.contains("header--menu-open")) {
					setMenu(false);
					burger.focus();
				} else if (active && desktop.matches) {
					const { button, dropdown } = active;
					if (dropdown.contains(document.activeElement)) button.focus();
					setActive(null);
				}
			});

			desktop.addEventListener("change", updateLayout);
			window.addEventListener(
				"scroll",
				() => {
					if (!scrollFrame) scrollFrame = requestAnimationFrame(updatePosition);
				},
				{ passive: true },
			);
			new ResizeObserver(measure).observe(frame);

			header.classList.toggle("header--fixed", fixed);
			updateLayout();
		});
	}

	// Popups
	function popupClose(popupActive) {
		popupActive.classList.remove("open");
		setTimeout(() => {
			if (!popupActive.classList.contains("open")) {
				popupActive.classList.remove("active");
			}
		}, 400);
		document.body.classList.remove("lock");
		document.querySelector("html").style.paddingRight = 0;
		document.querySelector("html").classList.remove("lock");
		//document.querySelector('header').removeAttribute('style');
	}
	const popupOpenBtns = document.querySelectorAll(".popup-btn");
	const popups = document.querySelectorAll(".popup");
	const originalTitlePopup2 = document.querySelector(".original-title")?.innerHTML ?? "";
	const closePopupBtns = document.querySelectorAll(".close-popup-btn");
	closePopupBtns.forEach(function (el) {
		el.addEventListener("click", function (e) {
			popupClose(e.target.closest(".popup"));
		});
	});
	popupOpenBtns.forEach(function (el) {
		el.addEventListener("click", function (e) {
			e.preventDefault();
			const path = e.currentTarget.dataset.path;
			const currentPopup = document.querySelector(`[data-target="${path}"]`);
			if (currentPopup) {
				popups.forEach(function (popup) {
					popupClose(popup);
					popup.addEventListener("click", function (e) {
						if (!e.target.closest(".popup__content")) {
							popupClose(e.target.closest(".popup"));
						}
					});
				});
				currentPopup.classList.add("active");
				setTimeout(() => {
					currentPopup.classList.add("open");
				}, 10);
				if (currentPopup.getAttribute("data-target") == "popup-change") {
					let originaTitle = currentPopup.querySelector(".original-title");
					if (el.classList.contains("change-item__btn")) {
						if (el.classList.contains("doctor__btn-js")) {
							let currentItem = el.closest(".change-item");
							let currentTitile = currentItem.querySelector(".change-item__title");
							originaTitle.innerHTML = "Записаться на приём к врачу: " + currentTitile.innerHTML;
						} else {
							if (el.classList.contains("change-item__btn_current")) {
								originaTitle.textContent = el.textContent;
							} else {
								let currentItem = el.closest(".change-item");
								let currentTitile = currentItem.querySelector(".change-item__title");
								originaTitle.innerHTML = currentTitile.innerHTML;
							}
						}
					} else {
						originaTitle.innerHTML = originalTitlePopup2;
					}
				}

				if (currentPopup.getAttribute("data-target") == "popup-jobs") {
					let currentItems = el.closest(".jobs__items");
					let originalText = currentPopup.querySelector(".jobs__inner_original");
					if (originalText && currentItems.querySelector(".jobs__inner")) {
						originalText.innerHTML = currentItems.querySelector(".jobs__inner").innerHTML;
					}
				}
				e.stopPropagation();
				scrollWidthFunc();
				document.querySelector("html").classList.add("lock");
			}
		});
	});
	// end popups

	/* yandex map */
	const mapPlaceholder = document.getElementById("map-placeholder");
	if (mapPlaceholder) {
		mapPlaceholder.addEventListener("mouseenter", loadMap, { once: true });
		mapPlaceholder.addEventListener("click", loadMap, { once: true });
	} else {
		loadMap();
	}

	function loadMap() {
		if (!document.querySelector('[src="https://api-maps.yandex.ru/2.1/?lang=ru_RU"]')) {
			const script = document.createElement("script");
			script.type = "text/javascript";
			script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
			script.onload = initMap;
			document.head.appendChild(script);
		} else {
			initMap();
		}
	}

	function initMap() {
		const mapPlaceholder = document.getElementById("map-placeholder");
		if (mapPlaceholder) {
			mapPlaceholder.remove();
		}

		ymaps.ready(function () {
			const myMap = new ymaps.Map("map", {
				center: [47.231129, 39.728721],
				zoom: 13,
				controls: [],
			});

			const myPlacemark = new ymaps.Placemark(
				[47.231129, 39.728721],
				{
					hintContent: "Ростов-на-Дону, ул. Красноармейская, д. 227",
					balloonContent: "Ростов-на-Дону, ул. Красноармейская, д. 227",
				},
				{
					iconLayout: "default#image",
					iconImageHref: "assets/img/icons/map-pin.png", //заменить на свою иконку
					iconImageSize: [21, 26],
					iconImageOffset: [-15, -31],
				},
			);

			myMap.geoObjects.add(myPlacemark);
			myMap.behaviors.disable(["scrollZoom"]);
		});
	}
	/* end yandex map */

	/*  search */
	const inputSearch = document.querySelectorAll("input[type=search]");
	if (inputSearch.length > 0) {
		inputSearch.forEach((elem) => {
			const wrapper = elem.closest(".search-wrapper");
			if (wrapper) {
				const searchResultBlock = wrapper.querySelector(".popup__search-result");
				const popularCitiesBlock = wrapper.querySelector(".popup__search");
				const noResultsMessage = searchResultBlock.querySelector(".no-results-message");

				function search() {
					let filter = elem.value.toUpperCase();
					let ul = wrapper.querySelectorAll(".search-list");
					let totalResults = 0;

					ul.forEach((item) => {
						let li = item.getElementsByTagName("li");
						for (let i = 0; i < li.length; i++) {
							let a = li[i].querySelector(".search-name");
							if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
								li[i].classList.remove("none");
								totalResults++;
							} else {
								li[i].classList.add("none");
							}
						}
					});
					noResultsMessage.classList.toggle("none", totalResults > 0);

					if (elem.value.trim() === "") {
						searchResultBlock.classList.add("none");
						popularCitiesBlock.classList.remove("none");
					} else {
						searchResultBlock.classList.remove("none");
						popularCitiesBlock.classList.add("none");
					}
				}
				elem.addEventListener("input", search);

				document.addEventListener("click", (event) => {
					if (!wrapper.contains(event.target)) {
						searchResultBlock.classList.add("none");
					}
				});
			}
		});
	}
	/*  end search  */

	/*  accordion  */
	const acc = document.getElementsByClassName("accordion");
	for (let i = 0; i < acc.length; i++) {
		if (acc[i]) {
			acc[i].addEventListener("click", function () {
				const accContent = this.querySelector(".accordion__content") || this.parentElement.querySelector(".accordion__content");
				if (accContent.classList.contains("active")) {
					accContent.classList.remove("active");
					this.classList.remove("active");
					accContent.style.maxHeight = "0";
				} else {
					accContent.classList.add("active");
					this.classList.add("active");

					const contentHeight = accContent.scrollHeight;
					accContent.style.maxHeight = `${contentHeight}px`;
				}
			});
		}
	}
	/*  end accordion   */

	/* FAQ - first child active */
	document.querySelectorAll(".faq__question").forEach((button) => {
		const content = button.nextElementSibling;
		const text = content?.querySelector(".faq__text");
		if (!content || !text) return;

		function updateAnswerHeight() {
			const isOpen = content.classList.contains("active");
			content.inert = !isOpen;

			if (isOpen) {
				content.style.maxHeight = text.scrollHeight + "px";
			}
		}

		updateAnswerHeight();
		button.addEventListener("click", updateAnswerHeight);
		new ResizeObserver(updateAnswerHeight).observe(text);
	});
	/* end FAQ - first child active */

	/*  tab  */
	const showTab = (elTabBtn) => {
		const elTab = elTabBtn.closest(".tab");
		if (elTabBtn.classList.contains("tab-btn--active")) {
			return;
		}
		const targetId = elTabBtn.dataset.id;
		const elTabPanes = elTab.querySelectorAll(`.tab-content[data-id="${targetId}"]`);

		const elTabBtnActive = elTab.querySelector(".tab-btn--active");
		if (elTabBtnActive) {
			elTabBtnActive.classList.remove("tab-btn--active");
		}

		const elTabPaneShow = elTab.querySelectorAll(".tab-content--active");
		elTabPaneShow.forEach((pane) => pane.classList.remove("tab-content--active"));

		elTabBtn.classList.add("tab-btn--active");
		elTabPanes.forEach((pane) => pane.classList.add("tab-content--active"));
	};

	const tabButtons = document.querySelectorAll(".tab-btn");
	tabButtons.forEach((btn) => {
		if (btn) {
			btn.addEventListener("click", function (e) {
				showTab(this);
			});
		}
	});
	/*  end tab */

	/*  btn more  */
	const moreBtns = document.querySelectorAll(".btn-more");
	moreBtns.forEach((moreBtn) => {
		if (moreBtn) {
			const moreContent = moreBtn.previousElementSibling;

			if (moreContent.scrollHeight <= moreContent.clientHeight) {
				moreBtn.style.display = "none";
			} else {
				const textBtn = moreBtn.innerHTML;
				moreBtn.addEventListener("click", function () {
					const heightMoreContent = moreContent.style.maxHeight;
					this.classList.toggle("active");

					if (moreContent.style.maxHeight) {
						moreContent.style.maxHeight = null;
						this.textContent = textBtn;
					} else {
						moreContent.style.maxHeight = moreContent.scrollHeight + "px";
						this.textContent = "Свернуть";
					}
				});
			}
		}
	});
	/*  end btn more  */

	/* navigation */
	document.querySelectorAll(".navigation").forEach((articleNavigation) => {
		const articleNavigationList = articleNavigation.querySelector(".navigation__list");
		if (!articleNavigationList) return;

		const jsScrollBlockList = [...document.querySelectorAll(".text-block h1, .text-block h2, .text-block h3, .text-block h4")].filter((heading) => heading.textContent.trim());
		const navigationToggle = articleNavigation.querySelector(".js-navigation-toggle");

		if (!jsScrollBlockList.length) {
			if (navigationToggle) articleNavigation.hidden = true;
			return;
		}

		function initNavigationToggle(button, content, title) {
			button.title = "Свернуть " + title;
			button.addEventListener("click", () => {
				const isClosed = content.toggleAttribute("inert");
				button.title = (isClosed ? "Развернуть " : "Свернуть ") + title;
			});
		}

		if (navigationToggle) {
			initNavigationToggle(navigationToggle, navigationToggle.nextElementSibling, "содержание");
		}

		const navigationParents = [];

		jsScrollBlockList.forEach((jsScrollBlock, index) => {
			const titleBlock = jsScrollBlock.textContent.trim();
			const tag = jsScrollBlock.tagName.toLowerCase();
			const level = Number(tag.slice(1));
			const articleNavigationItem = document.createElement("li");
			const articleNavigationLink = document.createElement("a");

			articleNavigationItem.classList.add("navigation__item", "nav-title-" + tag);
			articleNavigationLink.classList.add("navigation__link");

			if (!jsScrollBlock.id) {
				let id = "navigation-" + (index + 1);
				while (document.getElementById(id)) id += "-heading";
				jsScrollBlock.id = id;
			}

			articleNavigationLink.href = "#" + encodeURIComponent(jsScrollBlock.id);
			articleNavigationLink.textContent = titleBlock;
			articleNavigationLink.addEventListener("click", function (e) {
				if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
				e.preventDefault();

				const header = document.querySelector(".header__frame");
				const topOffset = navigationToggle ? (header?.offsetHeight || 0) + 16 : 280;
				const elementPosition = jsScrollBlock.getBoundingClientRect().top;

				window.scrollBy({
					top: elementPosition - topOffset,
					behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
				});
			});

			if (!navigationToggle) {
				articleNavigationItem.append(articleNavigationLink);
				articleNavigationList.append(articleNavigationItem);
				return;
			}

			articleNavigationItem.classList.add("outline__item");
			articleNavigationLink.classList.add("outline__link");

			const row = document.createElement("div");
			row.className = "outline__row";
			row.append(articleNavigationLink);
			articleNavigationItem.append(row);

			while (navigationParents.length && navigationParents.at(-1).level >= level) {
				navigationParents.pop();
			}

			const parent = level > 2 ? navigationParents.at(-1) : null;
			if (parent && !parent.list) {
				const button = document.createElement("button");
				button.type = "button";
				button.className = "outline__toggle";

				const collapse = document.createElement("div");
				collapse.className = "outline__collapse";
				parent.list = document.createElement("ul");
				parent.list.className = "outline__sublist";

				parent.row.append(button);
				collapse.append(parent.list);
				parent.item.append(collapse);
				initNavigationToggle(button, collapse, "подразделы «" + parent.title + "»");
			}

			const list = parent ? parent.list : articleNavigationList;
			list.append(articleNavigationItem);
			navigationParents.push({ level, row, item: articleNavigationItem, title: titleBlock, list: null });
		});
	});
	/* end navigation */

	/* Плавная прокрутка по ссылкам содержания */
	document.querySelectorAll('.sсroll-js[href^="#"]').forEach((link) => {
		link.addEventListener("click", function (event) {
			if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

			const target = document.getElementById(this.hash.slice(1));
			if (!target) return;

			event.preventDefault();

			const header = document.querySelector(".header__frame");
			const topOffset = (header?.offsetHeight || 0) + 16;
			const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

			window.scrollBy({
				top: target.getBoundingClientRect().top - topOffset,
				behavior: reduceMotion ? "instant" : "smooth",
			});
		});
	});

	document.querySelectorAll(".pricelist").forEach((section) => {
		const sidebar = section.querySelector(".pricelist__sidebar");
		const links = Array.from(section.querySelectorAll(".pricelist__link"));
		const groups = links.map((link) => section.querySelector(link.getAttribute("href")));
		if (!sidebar || !links.length || groups.some((group) => !group)) return;

		let current = -1;
		let frame = 0;

		function updateMenu() {
			frame = 0;
			const offset = parseFloat(getComputedStyle(groups[0]).scrollMarginTop) || 0;
			let index = 0;

			groups.forEach((group, groupIndex) => {
				if (group.getBoundingClientRect().top <= offset + 1) {
					index = groupIndex;
				}
			});

			if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
				index = groups.length - 1;
			}

			if (current === index) return;
			current = index;

			links.forEach((link, linkIndex) => {
				link.classList.toggle("active", linkIndex === index);
				link.classList.toggle("passed", linkIndex < index);
				link.parentElement.classList.toggle("passed", linkIndex < index);
			});

			if (window.innerWidth > 1024) {
				const linkRect = links[index].getBoundingClientRect();
				const sidebarRect = sidebar.getBoundingClientRect();

				if (linkRect.top < sidebarRect.top + 8) {
					sidebar.scrollBy({
						top: linkRect.top - sidebarRect.top - 8,
						behavior: "smooth",
					});
				} else if (linkRect.bottom > sidebarRect.bottom - 8) {
					sidebar.scrollBy({
						top: linkRect.bottom - sidebarRect.bottom + 8,
						behavior: "smooth",
					});
				}
			}
		}

		function queueUpdate() {
			if (!frame) frame = requestAnimationFrame(updateMenu);
		}

		links.forEach((link, index) => {
			link.addEventListener("click", function (event) {
				event.preventDefault();
				groups[index].scrollIntoView({
					behavior: "smooth",
					block: "start",
				});
			});
		});

		window.addEventListener("scroll", queueUpdate, { passive: true });
		window.addEventListener("resize", function () {
			current = -1;
			queueUpdate();
		});
		window.addEventListener("load", queueUpdate, { once: true });
		updateMenu();
	});

	/* Показать еще */
	document.querySelectorAll(".show-more-js").forEach((block) => {
		const items = Array.from(block.querySelectorAll(".show-more-item-js"));
		const button = block.querySelector(".show-more-btn-js");

		if (!items.length || !button) return;

		const controls = block.querySelector(".show-more-controls-js") || button;
		const initialCount = 16;
		const step = 8;
		let visibleCount = initialCount;

		function updateItems() {
			items.forEach((item, index) => {
				item.style.display = index < visibleCount ? "" : "none";
			});

			controls.style.display = visibleCount >= items.length ? "none" : "";
		}

		button.addEventListener("click", function () {
			visibleCount = Math.min(visibleCount + step, items.length);
			updateItems();
		});

		updateItems();
	});
	/* Конец Показать еще */

	/* calculator */
	document.querySelectorAll(".calculator").forEach((calculator) => {
		const fields = ["relation", "service", "age", "duration"].map((name) => calculator.querySelector(`select[name="${name}"]`));
		const [, serviceField, , durationField] = fields;
		const button = calculator.querySelector(".calculator__button");
		const result = calculator.querySelector(".calculator__value");
		const disclaimer = calculator.querySelector(".calculator__disclaimer");

		if (fields.some((field) => !field) || !button || !result || !disclaimer) return;

		const formatter = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 2 });

		button.addEventListener("click", () => {
			const coefficients = fields.map((field) => Number(field.selectedOptions[0]?.dataset.coefficient));
			const canCalculate = coefficients.every(Number.isFinite);
			let message = "";

			result.classList.toggle("calculator__value--error", !canCalculate);

			if (canCalculate) {
				const [relation, basePrice, age, duration] = coefficients;
				const service = Number(serviceField.value);
				const isRehabilitation = service === 4;
				const price = relation * age * basePrice * (isRehabilitation ? 1 : duration);

				if (isRehabilitation) {
					message = "Цена указана за 1 месяц. Минимальный курс 3 месяца.";
				} else if (service === 2 && Number(durationField.value) > 3) {
					message = "Рекомендуется пройти курс лечения. Цена указана за 1 сутки пребывания.";
				}

				result.textContent = formatter.format(price) + " ₽";
			} else {
				result.textContent = "Заполните все поля";
			}

			disclaimer.textContent = message;
			disclaimer.hidden = !message;
		});
	});
	/* end calculator */

	/* cookie */
	const cookies = document.querySelectorAll(".cookie");

	if (cookies.length) {
		const storageKey = "oniks-cookie-accepted";
		let accepted = false;

		try {
			accepted = localStorage.getItem(storageKey) === "1";
		} catch (error) {}

		function updateWidgetPosition() {
			let height = 0;

			cookies.forEach((cookie) => {
				if (!cookie.hidden && !cookie.classList.contains("cookie--hidden")) {
					height = Math.max(height, cookie.offsetHeight);
				}
			});

			document.querySelectorAll(".widget").forEach((widget) => {
				widget.style.setProperty("--cookie-offset", height ? height + 10 + "px" : "0px");
			});
		}

		cookies.forEach((cookie) => {
			const button = cookie.querySelector(".popup-cookie__btn");
			cookie.hidden = accepted;

			if (button) {
				button.addEventListener("click", () => {
					try {
						localStorage.setItem(storageKey, "1");
					} catch (error) {}

					cookies.forEach((item) => {
						item.classList.add("cookie--hidden");

						setTimeout(() => {
							item.hidden = true;
						}, 300);
					});

					updateWidgetPosition();
				});
			}
		});

		updateWidgetPosition();
		window.addEventListener("resize", updateWidgetPosition);

		if (typeof ResizeObserver !== "undefined") {
			const observer = new ResizeObserver(updateWidgetPosition);
			cookies.forEach((cookie) => observer.observe(cookie));
		}
	}
	/* end cookie */

	/* widget */
	document.querySelectorAll(".widget").forEach((widget) => {
		const button = widget.querySelector(".widget__toggle");
		const reveal = widget.querySelector(".widget__reveal");

		if (!button || !reveal) return;

		function toggleWidget(open) {
			widget.classList.toggle("widget--open", open);
			reveal.inert = !open;

			button.title = open ? "Закрыть способы связи" : "Открыть способы связи";
		}

		toggleWidget(false);

		button.addEventListener("click", () => {
			toggleWidget(!widget.classList.contains("widget--open"));
		});

		document.addEventListener("click", (event) => {
			if (!widget.contains(event.target)) {
				toggleWidget(false);
			}
		});

		document.addEventListener("keydown", (event) => {
			if (event.key === "Escape" && widget.classList.contains("widget--open")) {
				toggleWidget(false);
				button.focus();
			}
		});

		widget.querySelectorAll(".widget__link").forEach((link) => {
			link.addEventListener("click", () => toggleWidget(false));
		});
	});
	/* end widget */
});
