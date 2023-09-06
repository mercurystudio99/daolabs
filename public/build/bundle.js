(function (l, r) {
	if (!l || l.getElementById('livereloadscript')) return;
	r = l.createElement('script');
	r.async = 1;
	r.src =
		'//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1';
	r.id = 'livereloadscript';
	l.getElementsByTagName('head')[0].appendChild(r);
})(self.document);
var app = (function () {
	'use strict';

	function noop() {}
	const identity = (x) => x;
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return tar;
	}
	function add_location(element, file, line, column, char) {
		element.__svelte_meta = {
			loc: { file, line, column, char },
		};
	}
	function run(fn) {
		return fn();
	}
	function blank_object() {
		return Object.create(null);
	}
	function run_all(fns) {
		fns.forEach(run);
	}
	function is_function(thing) {
		return typeof thing === 'function';
	}
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}
	let src_url_equal_anchor;
	function src_url_equal(element_src, url) {
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}
	function validate_store(store, name) {
		if (store != null && typeof store.subscribe !== 'function') {
			throw new Error(`'${name}' is not a store with a 'subscribe' method`);
		}
	}
	function subscribe(store, ...callbacks) {
		if (store == null) {
			return noop;
		}
		const unsub = store.subscribe(...callbacks);
		return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
	}
	function get_store_value(store) {
		let value;
		subscribe(store, (_) => (value = _))();
		return value;
	}
	function component_subscribe(component, store, callback) {
		component.$$.on_destroy.push(subscribe(store, callback));
	}
	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}
	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}
	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn,
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}
	function exclude_internal_props(props) {
		const result = {};
		for (const k in props) if (k[0] !== '$') result[k] = props[k];
		return result;
	}
	function compute_rest_props(props, keys) {
		const rest = {};
		keys = new Set(keys);
		for (const k in props) if (!keys.has(k) && k[0] !== '$') rest[k] = props[k];
		return rest;
	}
	function null_to_empty(value) {
		return value == null ? '' : value;
	}

	const is_client = typeof window !== 'undefined';
	let now = is_client ? () => window.performance.now() : () => Date.now();
	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

	const tasks = new Set();
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}
	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 */
	function loop(callback) {
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			},
		};
	}
	function append(target, node) {
		target.appendChild(node);
	}
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && root.host) {
			return root;
		}
		return node.ownerDocument;
	}
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}
	function append_stylesheet(node, style) {
		append(node.head || node, style);
	}
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}
	function detach(node) {
		node.parentNode.removeChild(node);
	}
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}
	function element(name) {
		return document.createElement(name);
	}
	function svg_element(name) {
		return document.createElementNS('http://www.w3.org/2000/svg', name);
	}
	function text(data) {
		return document.createTextNode(data);
	}
	function space() {
		return text(' ');
	}
	function empty() {
		return text('');
	}
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}
	function set_attributes(node, attributes) {
		// @ts-ignore
		const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
		for (const key in attributes) {
			if (attributes[key] == null) {
				node.removeAttribute(key);
			} else if (key === 'style') {
				node.style.cssText = attributes[key];
			} else if (key === '__value') {
				node.value = node[key] = attributes[key];
			} else if (descriptors[key] && descriptors[key].set) {
				node[key] = attributes[key];
			} else {
				attr(node, key, attributes[key]);
			}
		}
	}
	function children(element) {
		return Array.from(element.childNodes);
	}
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}
	function set_style(node, key, value, important) {
		if (value === null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, important ? 'important' : '');
		}
	}
	function toggle_class(element, name, toggle) {
		element.classList[toggle ? 'add' : 'remove'](name);
	}
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		const e = document.createEvent('CustomEvent');
		e.initCustomEvent(type, bubbles, cancelable, detail);
		return e;
	}

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	const managed_styles = new Map();
	let active = 0;
	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	function hash(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
			animation ? `${animation}, ` : ''
		}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1, // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { stylesheet } = info;
				let i = stylesheet.cssRules.length;
				while (i--) stylesheet.deleteRule(i);
				info.rules = {};
			});
			managed_styles.clear();
		});
	}

	let current_component;
	function set_current_component(component) {
		current_component = component;
	}
	function get_current_component() {
		if (!current_component) throw new Error('Function called outside component initialization');
		return current_component;
	}
	function onMount(fn) {
		get_current_component().$$.on_mount.push(fn);
	}
	function onDestroy(fn) {
		get_current_component().$$.on_destroy.push(fn);
	}
	function createEventDispatcher() {
		const component = get_current_component();
		return (type, detail, { cancelable = false } = {}) => {
			const callbacks = component.$$.callbacks[type];
			if (callbacks) {
				// TODO are there situations where events could be dispatched
				// in a server (non-DOM) environment?
				const event = custom_event(type, detail, { cancelable });
				callbacks.slice().forEach((fn) => {
					fn.call(component, event);
				});
				return !event.defaultPrevented;
			}
			return true;
		};
	}
	function setContext(key, context) {
		get_current_component().$$.context.set(key, context);
		return context;
	}
	function getContext(key) {
		return get_current_component().$$.context.get(key);
	}

	const dirty_components = [];
	const binding_callbacks = [];
	const render_callbacks = [];
	const flush_callbacks = [];
	const resolved_promise = Promise.resolve();
	let update_scheduled = false;
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}
	function tick() {
		schedule_update();
		return resolved_promise;
	}
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}
	function add_flush_callback(fn) {
		flush_callbacks.push(fn);
	}
	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();
	let flushidx = 0; // Do *not* move this inside the flush() function
	function flush() {
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			while (flushidx < dirty_components.length) {
				const component = dirty_components[flushidx];
				flushidx++;
				set_current_component(component);
				update(component.$$);
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	let promise;
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
	}
	const outroing = new Set();
	let outros;
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros, // parent group
		};
	}
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		}
	}
	const null_transition = { duration: 0 };
	function create_in_transition(node, fn, params) {
		let config = fn(node, params);
		let running = false;
		let animation_name;
		let task;
		let uid = 0;
		function cleanup() {
			if (animation_name) delete_rule(node, animation_name);
		}
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css,
			} = config || null_transition;
			if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
			tick(0, 1);
			const start_time = now() + delay;
			const end_time = start_time + duration;
			if (task) task.abort();
			running = true;
			add_render_callback(() => dispatch(node, true, 'start'));
			task = loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(1, 0);
						dispatch(node, true, 'end');
						cleanup();
						return (running = false);
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(t, 1 - t);
					}
				}
				return running;
			});
		}
		let started = false;
		return {
			start() {
				if (started) return;
				started = true;
				delete_rule(node);
				if (is_function(config)) {
					config = config();
					wait().then(go);
				} else {
					go();
				}
			},
			invalidate() {
				started = false;
			},
			end() {
				if (running) {
					cleanup();
					running = false;
				}
			},
		};
	}
	function create_out_transition(node, fn, params) {
		let config = fn(node, params);
		let running = true;
		let animation_name;
		const group = outros;
		group.r += 1;
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css,
			} = config || null_transition;
			if (css) animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
			const start_time = now() + delay;
			const end_time = start_time + duration;
			add_render_callback(() => dispatch(node, false, 'start'));
			loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(0, 1);
						dispatch(node, false, 'end');
						if (!--group.r) {
							// this will result in `end()` being called,
							// so we don't need to clean up here
							run_all(group.c);
						}
						return false;
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(1 - t, t);
					}
				}
				return running;
			});
		}
		if (is_function(config)) {
			wait().then(() => {
				// @ts-ignore
				config = config();
				go();
			});
		} else {
			go();
		}
		return {
			end(reset) {
				if (reset && config.tick) {
					config.tick(1, 0);
				}
				if (running) {
					if (animation_name) delete_rule(node, animation_name);
					running = false;
				}
			},
		};
	}
	function create_bidirectional_transition(node, fn, params, intro) {
		let config = fn(node, params);
		let t = intro ? 0 : 1;
		let running_program = null;
		let pending_program = null;
		let animation_name = null;
		function clear_animation() {
			if (animation_name) delete_rule(node, animation_name);
		}
		function init(program, duration) {
			const d = program.b - t;
			duration *= Math.abs(d);
			return {
				a: t,
				b: program.b,
				d,
				duration,
				start: program.start,
				end: program.start + duration,
				group: program.group,
			};
		}
		function go(b) {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css,
			} = config || null_transition;
			const program = {
				start: now() + delay,
				b,
			};
			if (!b) {
				// @ts-ignore todo: improve typings
				program.group = outros;
				outros.r += 1;
			}
			if (running_program || pending_program) {
				pending_program = program;
			} else {
				// if this is an intro, and there's a delay, we need to do
				// an initial tick and/or apply CSS animation immediately
				if (css) {
					clear_animation();
					animation_name = create_rule(node, t, b, duration, delay, easing, css);
				}
				if (b) tick(0, 1);
				running_program = init(program, duration);
				add_render_callback(() => dispatch(node, b, 'start'));
				loop((now) => {
					if (pending_program && now > pending_program.start) {
						running_program = init(pending_program, duration);
						pending_program = null;
						dispatch(node, running_program.b, 'start');
						if (css) {
							clear_animation();
							animation_name = create_rule(
								node,
								t,
								running_program.b,
								running_program.duration,
								0,
								easing,
								config.css,
							);
						}
					}
					if (running_program) {
						if (now >= running_program.end) {
							tick((t = running_program.b), 1 - t);
							dispatch(node, running_program.b, 'end');
							if (!pending_program) {
								// we're done
								if (running_program.b) {
									// intro — we can tidy up immediately
									clear_animation();
								} else {
									// outro — needs to be coordinated
									if (!--running_program.group.r) run_all(running_program.group.c);
								}
							}
							running_program = null;
						} else if (now >= running_program.start) {
							const p = now - running_program.start;
							t = running_program.a + running_program.d * easing(p / running_program.duration);
							tick(t, 1 - t);
						}
					}
					return !!(running_program || pending_program);
				});
			}
		}
		return {
			run(b) {
				if (is_function(config)) {
					wait().then(() => {
						// @ts-ignore
						config = config();
						go(b);
					});
				} else {
					go(b);
				}
			},
			end() {
				clear_animation();
				running_program = pending_program = null;
			},
		};
	}

	const globals =
		typeof window !== 'undefined'
			? window
			: typeof globalThis !== 'undefined'
			? globalThis
			: global;

	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}
	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	function bind(component, name, callback) {
		const index = component.$$.props[name];
		if (index !== undefined) {
			component.$$.bound[index] = callback;
			callback(component.$$.ctx[index]);
		}
	}
	function create_component(block) {
		block && block.c();
	}
	function mount_component(component, target, anchor, customElement) {
		const { fragment, on_mount, on_destroy, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		if (!customElement) {
			// onMount happens before the initial afterUpdate
			add_render_callback(() => {
				const new_on_destroy = on_mount.map(run).filter(is_function);
				if (on_destroy) {
					on_destroy.push(...new_on_destroy);
				} else {
					// Edge case - component was destroyed immediately,
					// most likely as a result of a binding initialising
					run_all(new_on_destroy);
				}
				component.$$.on_mount = [];
			});
		}
		after_update.forEach(add_render_callback);
	}
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles,
		dirty = [-1],
	) {
		const parent_component = current_component;
		set_current_component(component);
		const $$ = (component.$$ = {
			fragment: null,
			ctx: null,
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root,
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				const nodes = children(options.target);
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor, options.customElement);
			flush();
		}
		set_current_component(parent_component);
	}
	/**
	 * Base class for Svelte components. Used when dev=false.
	 */
	class SvelteComponent {
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}
		$on(type, callback) {
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}
		$set($$props) {
			if (this.$$set && !is_empty($$props)) {
				this.$$.skip_bound = true;
				this.$$set($$props);
				this.$$.skip_bound = false;
			}
		}
	}

	function dispatch_dev(type, detail) {
		document.dispatchEvent(
			custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }),
		);
	}
	function append_dev(target, node) {
		dispatch_dev('SvelteDOMInsert', { target, node });
		append(target, node);
	}
	function insert_dev(target, node, anchor) {
		dispatch_dev('SvelteDOMInsert', { target, node, anchor });
		insert(target, node, anchor);
	}
	function detach_dev(node) {
		dispatch_dev('SvelteDOMRemove', { node });
		detach(node);
	}
	function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
		const modifiers =
			options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
		if (has_prevent_default) modifiers.push('preventDefault');
		if (has_stop_propagation) modifiers.push('stopPropagation');
		dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
		const dispose = listen(node, event, handler, options);
		return () => {
			dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
			dispose();
		};
	}
	function attr_dev(node, attribute, value) {
		attr(node, attribute, value);
		if (value == null) dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
		else dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
	}
	function prop_dev(node, property, value) {
		node[property] = value;
		dispatch_dev('SvelteDOMSetProperty', { node, property, value });
	}
	function set_data_dev(text, data) {
		data = '' + data;
		if (text.wholeText === data) return;
		dispatch_dev('SvelteDOMSetData', { node: text, data });
		text.data = data;
	}
	function validate_each_argument(arg) {
		if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
			let msg = '{#each} only iterates over array-like objects.';
			if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
				msg += ' You can use a spread to convert this iterable into an array.';
			}
			throw new Error(msg);
		}
	}
	function validate_slots(name, slot, keys) {
		for (const slot_key of Object.keys(slot)) {
			if (!~keys.indexOf(slot_key)) {
				console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
			}
		}
	}
	/**
	 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
	 */
	class SvelteComponentDev extends SvelteComponent {
		constructor(options) {
			if (!options || (!options.target && !options.$$inline)) {
				throw new Error("'target' is a required option");
			}
			super();
		}
		$destroy() {
			super.$destroy();
			this.$destroy = () => {
				console.warn('Component was already destroyed'); // eslint-disable-line no-console
			};
		}
		$capture_state() {}
		$inject_state() {}
	}

	/*
	 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/utils.js
	 *
	 * https://github.com/reach/router/blob/master/LICENSE
	 */

	const isUndefined = (value) => typeof value === 'undefined';

	const isFunction = (value) => typeof value === 'function';

	const isNumber = (value) => typeof value === 'number';

	/**
	 * Decides whether a given `event` should result in a navigation or not.
	 * @param {object} event
	 */
	function shouldNavigate(event) {
		return (
			!event.defaultPrevented &&
			event.button === 0 &&
			!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey)
		);
	}

	function createCounter() {
		let i = 0;
		/**
		 * Returns an id and increments the internal state
		 * @returns {number}
		 */
		return () => i++;
	}

	/**
	 * Create a globally unique id
	 *
	 * @returns {string} An id
	 */
	function createGlobalId() {
		return Math.random().toString(36).substring(2);
	}

	const isSSR = typeof window === 'undefined';

	function addListener(target, type, handler) {
		target.addEventListener(type, handler);
		return () => target.removeEventListener(type, handler);
	}

	const subscriber_queue = [];
	/**
	 * Creates a `Readable` store that allows reading by subscription.
	 * @param value initial value
	 * @param {StartStopNotifier}start start and stop notifications for subscriptions
	 */
	function readable(value, start) {
		return {
			subscribe: writable(value, start).subscribe,
		};
	}
	/**
	 * Create a `Writable` store that allows both updating and reading by subscription.
	 * @param {*=}value initial value
	 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
	 */
	function writable(value, start = noop) {
		let stop;
		const subscribers = new Set();
		function set(new_value) {
			if (safe_not_equal(value, new_value)) {
				value = new_value;
				if (stop) {
					// store is ready
					const run_queue = !subscriber_queue.length;
					for (const subscriber of subscribers) {
						subscriber[1]();
						subscriber_queue.push(subscriber, value);
					}
					if (run_queue) {
						for (let i = 0; i < subscriber_queue.length; i += 2) {
							subscriber_queue[i][0](subscriber_queue[i + 1]);
						}
						subscriber_queue.length = 0;
					}
				}
			}
		}
		function update(fn) {
			set(fn(value));
		}
		function subscribe(run, invalidate = noop) {
			const subscriber = [run, invalidate];
			subscribers.add(subscriber);
			if (subscribers.size === 1) {
				stop = start(set) || noop;
			}
			run(value);
			return () => {
				subscribers.delete(subscriber);
				if (subscribers.size === 0) {
					stop();
					stop = null;
				}
			};
		}
		return { set, update, subscribe };
	}
	function derived(stores, fn, initial_value) {
		const single = !Array.isArray(stores);
		const stores_array = single ? [stores] : stores;
		const auto = fn.length < 2;
		return readable(initial_value, (set) => {
			let inited = false;
			const values = [];
			let pending = 0;
			let cleanup = noop;
			const sync = () => {
				if (pending) {
					return;
				}
				cleanup();
				const result = fn(single ? values[0] : values, set);
				if (auto) {
					set(result);
				} else {
					cleanup = is_function(result) ? result : noop;
				}
			};
			const unsubscribers = stores_array.map((store, i) =>
				subscribe(
					store,
					(value) => {
						values[i] = value;
						pending &= ~(1 << i);
						if (inited) {
							sync();
						}
					},
					() => {
						pending |= 1 << i;
					},
				),
			);
			inited = true;
			sync();
			return function stop() {
				run_all(unsubscribers);
				cleanup();
			};
		});
	}

	/*
	 * Adapted from https://github.com/EmilTholin/svelte-routing
	 *
	 * https://github.com/EmilTholin/svelte-routing/blob/master/LICENSE
	 */

	const createKey = (ctxName) => `@@svnav-ctx__${ctxName}`;

	// Use strings instead of objects, so different versions of
	// svelte-navigator can potentially still work together
	const LOCATION = createKey('LOCATION');
	const ROUTER = createKey('ROUTER');
	const ROUTE = createKey('ROUTE');
	const ROUTE_PARAMS = createKey('ROUTE_PARAMS');
	const FOCUS_ELEM = createKey('FOCUS_ELEM');

	const paramRegex = /^:(.+)/;

	/**
	 * Check if `string` starts with `search`
	 * @param {string} string
	 * @param {string} search
	 * @return {boolean}
	 */
	const startsWith = (string, search) => string.substr(0, search.length) === search;

	/**
	 * Check if `segment` is a root segment
	 * @param {string} segment
	 * @return {boolean}
	 */
	const isRootSegment = (segment) => segment === '';

	/**
	 * Check if `segment` is a dynamic segment
	 * @param {string} segment
	 * @return {boolean}
	 */
	const isDynamic = (segment) => paramRegex.test(segment);

	/**
	 * Check if `segment` is a splat
	 * @param {string} segment
	 * @return {boolean}
	 */
	const isSplat = (segment) => segment[0] === '*';

	/**
	 * Strip potention splat and splatname of the end of a path
	 * @param {string} str
	 * @return {string}
	 */
	const stripSplat = (str) => str.replace(/\*.*$/, '');

	/**
	 * Strip `str` of potential start and end `/`
	 * @param {string} str
	 * @return {string}
	 */
	const stripSlashes = (str) => str.replace(/(^\/+|\/+$)/g, '');

	/**
	 * Split up the URI into segments delimited by `/`
	 * @param {string} uri
	 * @return {string[]}
	 */
	function segmentize(uri, filterFalsy = false) {
		const segments = stripSlashes(uri).split('/');
		return filterFalsy ? segments.filter(Boolean) : segments;
	}

	/**
	 * Add the query to the pathname if a query is given
	 * @param {string} pathname
	 * @param {string} [query]
	 * @return {string}
	 */
	const addQuery = (pathname, query) => pathname + (query ? `?${query}` : '');

	/**
	 * Normalizes a basepath
	 *
	 * @param {string} path
	 * @returns {string}
	 *
	 * @example
	 * normalizePath("base/path/") // -> "/base/path"
	 */
	const normalizePath = (path) => `/${stripSlashes(path)}`;

	/**
	 * Joins and normalizes multiple path fragments
	 *
	 * @param {...string} pathFragments
	 * @returns {string}
	 */
	function join(...pathFragments) {
		const joinFragment = (fragment) => segmentize(fragment, true).join('/');
		const joinedSegments = pathFragments.map(joinFragment).join('/');
		return normalizePath(joinedSegments);
	}

	// We start from 1 here, so we can check if an origin id has been passed
	// by using `originId || <fallback>`
	const LINK_ID = 1;
	const ROUTE_ID = 2;
	const ROUTER_ID = 3;
	const USE_FOCUS_ID = 4;
	const USE_LOCATION_ID = 5;
	const USE_MATCH_ID = 6;
	const USE_NAVIGATE_ID = 7;
	const USE_PARAMS_ID = 8;
	const USE_RESOLVABLE_ID = 9;
	const USE_RESOLVE_ID = 10;
	const NAVIGATE_ID = 11;

	const labels = {
		[LINK_ID]: 'Link',
		[ROUTE_ID]: 'Route',
		[ROUTER_ID]: 'Router',
		[USE_FOCUS_ID]: 'useFocus',
		[USE_LOCATION_ID]: 'useLocation',
		[USE_MATCH_ID]: 'useMatch',
		[USE_NAVIGATE_ID]: 'useNavigate',
		[USE_PARAMS_ID]: 'useParams',
		[USE_RESOLVABLE_ID]: 'useResolvable',
		[USE_RESOLVE_ID]: 'useResolve',
		[NAVIGATE_ID]: 'navigate',
	};

	const createLabel = (labelId) => labels[labelId];

	function createIdentifier(labelId, props) {
		let attr;
		if (labelId === ROUTE_ID) {
			attr = props.path ? `path="${props.path}"` : 'default';
		} else if (labelId === LINK_ID) {
			attr = `to="${props.to}"`;
		} else if (labelId === ROUTER_ID) {
			attr = `basepath="${props.basepath || ''}"`;
		}
		return `<${createLabel(labelId)} ${attr || ''} />`;
	}

	function createMessage(labelId, message, props, originId) {
		const origin = props && createIdentifier(originId || labelId, props);
		const originMsg = origin ? `\n\nOccurred in: ${origin}` : '';
		const label = createLabel(labelId);
		const msg = isFunction(message) ? message(label) : message;
		return `<${label}> ${msg}${originMsg}`;
	}

	const createMessageHandler =
		(handler) =>
		(...args) =>
			handler(createMessage(...args));

	const fail = createMessageHandler((message) => {
		throw new Error(message);
	});

	// eslint-disable-next-line no-console
	const warn = createMessageHandler(console.warn);

	const SEGMENT_POINTS = 4;
	const STATIC_POINTS = 3;
	const DYNAMIC_POINTS = 2;
	const SPLAT_PENALTY = 1;
	const ROOT_POINTS = 1;

	/**
	 * Score a route depending on how its individual segments look
	 * @param {object} route
	 * @param {number} index
	 * @return {object}
	 */
	function rankRoute(route, index) {
		const score = route.default
			? 0
			: segmentize(route.fullPath).reduce((acc, segment) => {
					let nextScore = acc;
					nextScore += SEGMENT_POINTS;

					if (isRootSegment(segment)) {
						nextScore += ROOT_POINTS;
					} else if (isDynamic(segment)) {
						nextScore += DYNAMIC_POINTS;
					} else if (isSplat(segment)) {
						nextScore -= SEGMENT_POINTS + SPLAT_PENALTY;
					} else {
						nextScore += STATIC_POINTS;
					}

					return nextScore;
			  }, 0);

		return { route, score, index };
	}

	/**
	 * Give a score to all routes and sort them on that
	 * @param {object[]} routes
	 * @return {object[]}
	 */
	function rankRoutes(routes) {
		return (
			routes
				.map(rankRoute)
				// If two routes have the exact same score, we go by index instead
				.sort((a, b) => {
					if (a.score < b.score) {
						return 1;
					}
					if (a.score > b.score) {
						return -1;
					}
					return a.index - b.index;
				})
		);
	}

	/**
	 * Ranks and picks the best route to match. Each segment gets the highest
	 * amount of points, then the type of segment gets an additional amount of
	 * points where
	 *
	 *  static > dynamic > splat > root
	 *
	 * This way we don't have to worry about the order of our routes, let the
	 * computers do it.
	 *
	 * A route looks like this
	 *
	 *  { fullPath, default, value }
	 *
	 * And a returned match looks like:
	 *
	 *  { route, params, uri }
	 *
	 * @param {object[]} routes
	 * @param {string} uri
	 * @return {?object}
	 */
	function pick(routes, uri) {
		let bestMatch;
		let defaultMatch;

		const [uriPathname] = uri.split('?');
		const uriSegments = segmentize(uriPathname);
		const isRootUri = uriSegments[0] === '';
		const ranked = rankRoutes(routes);

		for (let i = 0, l = ranked.length; i < l; i++) {
			const { route } = ranked[i];
			let missed = false;
			const params = {};

			// eslint-disable-next-line no-shadow
			const createMatch = (uri) => ({ ...route, params, uri });

			if (route.default) {
				defaultMatch = createMatch(uri);
				continue;
			}

			const routeSegments = segmentize(route.fullPath);
			const max = Math.max(uriSegments.length, routeSegments.length);
			let index = 0;

			for (; index < max; index++) {
				const routeSegment = routeSegments[index];
				const uriSegment = uriSegments[index];

				if (!isUndefined(routeSegment) && isSplat(routeSegment)) {
					// Hit a splat, just grab the rest, and return a match
					// uri:   /files/documents/work
					// route: /files/* or /files/*splatname
					const splatName = routeSegment === '*' ? '*' : routeSegment.slice(1);

					params[splatName] = uriSegments.slice(index).map(decodeURIComponent).join('/');
					break;
				}

				if (isUndefined(uriSegment)) {
					// URI is shorter than the route, no match
					// uri:   /users
					// route: /users/:userId
					missed = true;
					break;
				}

				const dynamicMatch = paramRegex.exec(routeSegment);

				if (dynamicMatch && !isRootUri) {
					const value = decodeURIComponent(uriSegment);
					params[dynamicMatch[1]] = value;
				} else if (routeSegment !== uriSegment) {
					// Current segments don't match, not dynamic, not splat, so no match
					// uri:   /users/123/settings
					// route: /users/:id/profile
					missed = true;
					break;
				}
			}

			if (!missed) {
				bestMatch = createMatch(join(...uriSegments.slice(0, index)));
				break;
			}
		}

		return bestMatch || defaultMatch || null;
	}

	/**
	 * Check if the `route.fullPath` matches the `uri`.
	 * @param {Object} route
	 * @param {string} uri
	 * @return {?object}
	 */
	function match(route, uri) {
		return pick([route], uri);
	}

	/**
	 * Resolve URIs as though every path is a directory, no files. Relative URIs
	 * in the browser can feel awkward because not only can you be "in a directory",
	 * you can be "at a file", too. For example:
	 *
	 *  browserSpecResolve('foo', '/bar/') => /bar/foo
	 *  browserSpecResolve('foo', '/bar') => /foo
	 *
	 * But on the command line of a file system, it's not as complicated. You can't
	 * `cd` from a file, only directories. This way, links have to know less about
	 * their current path. To go deeper you can do this:
	 *
	 *  <Link to="deeper"/>
	 *  // instead of
	 *  <Link to=`{${props.uri}/deeper}`/>
	 *
	 * Just like `cd`, if you want to go deeper from the command line, you do this:
	 *
	 *  cd deeper
	 *  # not
	 *  cd $(pwd)/deeper
	 *
	 * By treating every path as a directory, linking to relative paths should
	 * require less contextual information and (fingers crossed) be more intuitive.
	 * @param {string} to
	 * @param {string} base
	 * @return {string}
	 */
	function resolve(to, base) {
		// /foo/bar, /baz/qux => /foo/bar
		if (startsWith(to, '/')) {
			return to;
		}

		const [toPathname, toQuery] = to.split('?');
		const [basePathname] = base.split('?');
		const toSegments = segmentize(toPathname);
		const baseSegments = segmentize(basePathname);

		// ?a=b, /users?b=c => /users?a=b
		if (toSegments[0] === '') {
			return addQuery(basePathname, toQuery);
		}

		// profile, /users/789 => /users/789/profile
		if (!startsWith(toSegments[0], '.')) {
			const pathname = baseSegments.concat(toSegments).join('/');
			return addQuery((basePathname === '/' ? '' : '/') + pathname, toQuery);
		}

		// ./       , /users/123 => /users/123
		// ../      , /users/123 => /users
		// ../..    , /users/123 => /
		// ../../one, /a/b/c/d   => /a/b/one
		// .././one , /a/b/c/d   => /a/b/c/one
		const allSegments = baseSegments.concat(toSegments);
		const segments = [];

		allSegments.forEach((segment) => {
			if (segment === '..') {
				segments.pop();
			} else if (segment !== '.') {
				segments.push(segment);
			}
		});

		return addQuery(`/${segments.join('/')}`, toQuery);
	}

	/**
	 * Normalizes a location for consumption by `Route` children and the `Router`.
	 * It removes the apps basepath from the pathname
	 * and sets default values for `search` and `hash` properties.
	 *
	 * @param {Object} location The current global location supplied by the history component
	 * @param {string} basepath The applications basepath (i.e. when serving from a subdirectory)
	 *
	 * @returns The normalized location
	 */
	function normalizeLocation(location, basepath) {
		const { pathname, hash = '', search = '', state } = location;
		const baseSegments = segmentize(basepath, true);
		const pathSegments = segmentize(pathname, true);
		while (baseSegments.length) {
			if (baseSegments[0] !== pathSegments[0]) {
				fail(
					ROUTER_ID,
					`Invalid state: All locations must begin with the basepath "${basepath}", found "${pathname}"`,
				);
			}
			baseSegments.shift();
			pathSegments.shift();
		}
		return {
			pathname: join(...pathSegments),
			hash,
			search,
			state,
		};
	}

	const normalizeUrlFragment = (frag) => (frag.length === 1 ? '' : frag);

	/**
	 * Creates a location object from an url.
	 * It is used to create a location from the url prop used in SSR
	 *
	 * @param {string} url The url string (e.g. "/path/to/somewhere")
	 *
	 * @returns {{ pathname: string; search: string; hash: string }} The location
	 */
	function createLocation(url) {
		const searchIndex = url.indexOf('?');
		const hashIndex = url.indexOf('#');
		const hasSearchIndex = searchIndex !== -1;
		const hasHashIndex = hashIndex !== -1;
		const hash = hasHashIndex ? normalizeUrlFragment(url.substr(hashIndex)) : '';
		const pathnameAndSearch = hasHashIndex ? url.substr(0, hashIndex) : url;
		const search = hasSearchIndex
			? normalizeUrlFragment(pathnameAndSearch.substr(searchIndex))
			: '';
		const pathname = hasSearchIndex ? pathnameAndSearch.substr(0, searchIndex) : pathnameAndSearch;
		return { pathname, search, hash };
	}

	/**
	 * Resolves a link relative to the parent Route and the Routers basepath.
	 *
	 * @param {string} path The given path, that will be resolved
	 * @param {string} routeBase The current Routes base path
	 * @param {string} appBase The basepath of the app. Used, when serving from a subdirectory
	 * @returns {string} The resolved path
	 *
	 * @example
	 * resolveLink("relative", "/routeBase", "/") // -> "/routeBase/relative"
	 * resolveLink("/absolute", "/routeBase", "/") // -> "/absolute"
	 * resolveLink("relative", "/routeBase", "/base") // -> "/base/routeBase/relative"
	 * resolveLink("/absolute", "/routeBase", "/base") // -> "/base/absolute"
	 */
	function resolveLink(path, routeBase, appBase) {
		return join(appBase, resolve(path, routeBase));
	}

	/**
	 * Get the uri for a Route, by matching it against the current location.
	 *
	 * @param {string} routePath The Routes resolved path
	 * @param {string} pathname The current locations pathname
	 */
	function extractBaseUri(routePath, pathname) {
		const fullPath = normalizePath(stripSplat(routePath));
		const baseSegments = segmentize(fullPath, true);
		const pathSegments = segmentize(pathname, true).slice(0, baseSegments.length);
		const routeMatch = match({ fullPath }, join(...pathSegments));
		return routeMatch && routeMatch.uri;
	}

	/*
	 * Adapted from https://github.com/reach/router/blob/b60e6dd781d5d3a4bdaaf4de665649c0f6a7e78d/src/lib/history.js
	 *
	 * https://github.com/reach/router/blob/master/LICENSE
	 */

	const POP = 'POP';
	const PUSH = 'PUSH';
	const REPLACE = 'REPLACE';

	function getLocation(source) {
		return {
			...source.location,
			pathname: encodeURI(decodeURI(source.location.pathname)),
			state: source.history.state,
			_key: (source.history.state && source.history.state._key) || 'initial',
		};
	}

	function createHistory(source) {
		let listeners = [];
		let location = getLocation(source);
		let action = POP;

		const notifyListeners = (listenerFns = listeners) =>
			listenerFns.forEach((listener) => listener({ location, action }));

		return {
			get location() {
				return location;
			},
			listen(listener) {
				listeners.push(listener);

				const popstateListener = () => {
					location = getLocation(source);
					action = POP;
					notifyListeners([listener]);
				};

				// Call listener when it is registered
				notifyListeners([listener]);

				const unlisten = addListener(source, 'popstate', popstateListener);
				return () => {
					unlisten();
					listeners = listeners.filter((fn) => fn !== listener);
				};
			},
			/**
			 * Navigate to a new absolute route.
			 *
			 * @param {string|number} to The path to navigate to.
			 *
			 * If `to` is a number we will navigate to the stack entry index + `to`
			 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
			 * @param {Object} options
			 * @param {*} [options.state] The state will be accessible through `location.state`
			 * @param {boolean} [options.replace=false] Replace the current entry in the history
			 * stack, instead of pushing on a new one
			 */
			navigate(to, options) {
				const { state = {}, replace = false } = options || {};
				action = replace ? REPLACE : PUSH;
				if (isNumber(to)) {
					if (options) {
						warn(
							NAVIGATE_ID,
							'Navigation options (state or replace) are not supported, ' +
								'when passing a number as the first argument to navigate. ' +
								'They are ignored.',
						);
					}
					action = POP;
					source.history.go(to);
				} else {
					const keyedState = { ...state, _key: createGlobalId() };
					// try...catch iOS Safari limits to 100 pushState calls
					try {
						source.history[replace ? 'replaceState' : 'pushState'](keyedState, '', to);
					} catch (e) {
						source.location[replace ? 'replace' : 'assign'](to);
					}
				}

				location = getLocation(source);
				notifyListeners();
			},
		};
	}

	function createStackFrame(state, uri) {
		return { ...createLocation(uri), state };
	}

	// Stores history entries in memory for testing or other platforms like Native
	function createMemorySource(initialPathname = '/') {
		let index = 0;
		let stack = [createStackFrame(null, initialPathname)];

		return {
			// This is just for testing...
			get entries() {
				return stack;
			},
			get location() {
				return stack[index];
			},
			addEventListener() {},
			removeEventListener() {},
			history: {
				get state() {
					return stack[index].state;
				},
				pushState(state, title, uri) {
					index++;
					// Throw away anything in the stack with an index greater than the current index.
					// This happens, when we go back using `go(-n)`. The index is now less than `stack.length`.
					// If we call `go(+n)` the stack entries with an index greater than the current index can
					// be reused.
					// However, if we navigate to a path, instead of a number, we want to create a new branch
					// of navigation.
					stack = stack.slice(0, index);
					stack.push(createStackFrame(state, uri));
				},
				replaceState(state, title, uri) {
					stack[index] = createStackFrame(state, uri);
				},
				go(to) {
					const newIndex = index + to;
					if (newIndex < 0 || newIndex > stack.length - 1) {
						return;
					}
					index = newIndex;
				},
			},
		};
	}

	// Global history uses window.history as the source if available,
	// otherwise a memory history
	const canUseDOM = !!(!isSSR && window.document && window.document.createElement);
	// Use memory history in iframes (for example in Svelte REPL)
	const isEmbeddedPage = !isSSR && window.location.origin === 'null';
	const globalHistory = createHistory(canUseDOM && !isEmbeddedPage ? window : createMemorySource());

	// We need to keep the focus candidate in a separate file, so svelte does
	// not update, when we mutate it.
	// Also, we need a single global reference, because taking focus needs to
	// work globally, even if we have multiple top level routers
	// eslint-disable-next-line import/no-mutable-exports
	let focusCandidate = null;

	// eslint-disable-next-line import/no-mutable-exports
	let initialNavigation = true;

	/**
	 * Check if RouterA is above RouterB in the document
	 * @param {number} routerIdA The first Routers id
	 * @param {number} routerIdB The second Routers id
	 */
	function isAbove(routerIdA, routerIdB) {
		const routerMarkers = document.querySelectorAll('[data-svnav-router]');
		for (let i = 0; i < routerMarkers.length; i++) {
			const node = routerMarkers[i];
			const currentId = Number(node.dataset.svnavRouter);
			if (currentId === routerIdA) return true;
			if (currentId === routerIdB) return false;
		}
		return false;
	}

	/**
     * Check if a Route candidate is the best choice to move focus to,
     * and store the best match.
     * @param {{
         level: number;
         routerId: number;
         route: {
           id: number;
           focusElement: import("svelte/store").Readable<Promise<Element>|null>;
         }
       }} item A Route candidate, that updated and is visible after a navigation
     */
	function pushFocusCandidate(item) {
		if (
			// Best candidate if it's the only candidate...
			!focusCandidate ||
			// Route is nested deeper, than previous candidate
			// -> Route change was triggered in the deepest affected
			// Route, so that's were focus should move to
			item.level > focusCandidate.level ||
			// If the level is identical, we want to focus the first Route in the document,
			// so we pick the first Router lookin from page top to page bottom.
			(item.level === focusCandidate.level && isAbove(item.routerId, focusCandidate.routerId))
		) {
			focusCandidate = item;
		}
	}

	/**
	 * Reset the focus candidate.
	 */
	function clearFocusCandidate() {
		focusCandidate = null;
	}

	function initialNavigationOccurred() {
		initialNavigation = false;
	}

	/*
	 * `focus` Adapted from https://github.com/oaf-project/oaf-side-effects/blob/master/src/index.ts
	 *
	 * https://github.com/oaf-project/oaf-side-effects/blob/master/LICENSE
	 */
	function focus(elem) {
		if (!elem) return false;
		const TABINDEX = 'tabindex';
		try {
			if (!elem.hasAttribute(TABINDEX)) {
				elem.setAttribute(TABINDEX, '-1');
				let unlisten;
				// We remove tabindex after blur to avoid weird browser behavior
				// where a mouse click can activate elements with tabindex="-1".
				const blurListener = () => {
					elem.removeAttribute(TABINDEX);
					unlisten();
				};
				unlisten = addListener(elem, 'blur', blurListener);
			}
			elem.focus();
			return document.activeElement === elem;
		} catch (e) {
			// Apparently trying to focus a disabled element in IE can throw.
			// See https://stackoverflow.com/a/1600194/2476884
			return false;
		}
	}

	function isEndMarker(elem, id) {
		return Number(elem.dataset.svnavRouteEnd) === id;
	}

	function isHeading(elem) {
		return /^H[1-6]$/i.test(elem.tagName);
	}

	function query(selector, parent = document) {
		return parent.querySelector(selector);
	}

	function queryHeading(id) {
		const marker = query(`[data-svnav-route-start="${id}"]`);
		let current = marker.nextElementSibling;
		while (!isEndMarker(current, id)) {
			if (isHeading(current)) {
				return current;
			}
			const heading = query('h1,h2,h3,h4,h5,h6', current);
			if (heading) {
				return heading;
			}
			current = current.nextElementSibling;
		}
		return null;
	}

	function handleFocus(route) {
		Promise.resolve(get_store_value(route.focusElement)).then((elem) => {
			const focusElement = elem || queryHeading(route.id);
			if (!focusElement) {
				warn(
					ROUTER_ID,
					'Could not find an element to focus. ' +
						'You should always render a header for accessibility reasons, ' +
						'or set a custom focus element via the "useFocus" hook. ' +
						"If you don't want this Route or Router to manage focus, " +
						'pass "primary={false}" to it.',
					route,
					ROUTE_ID,
				);
			}
			const headingFocused = focus(focusElement);
			if (headingFocused) return;
			focus(document.documentElement);
		});
	}

	const createTriggerFocus =
		(a11yConfig, announcementText, location) => (manageFocus, announceNavigation) =>
			// Wait until the dom is updated, so we can look for headings
			tick().then(() => {
				if (!focusCandidate || initialNavigation) {
					initialNavigationOccurred();
					return;
				}
				if (manageFocus) {
					handleFocus(focusCandidate.route);
				}
				if (a11yConfig.announcements && announceNavigation) {
					const { path, fullPath, meta, params, uri } = focusCandidate.route;
					const announcementMessage = a11yConfig.createAnnouncement(
						{ path, fullPath, meta, params, uri },
						get_store_value(location),
					);
					Promise.resolve(announcementMessage).then((message) => {
						announcementText.set(message);
					});
				}
				clearFocusCandidate();
			});

	const visuallyHiddenStyle =
		'position:fixed;' +
		'top:-1px;' +
		'left:0;' +
		'width:1px;' +
		'height:1px;' +
		'padding:0;' +
		'overflow:hidden;' +
		'clip:rect(0,0,0,0);' +
		'white-space:nowrap;' +
		'border:0;';

	/* node_modules/svelte-navigator/src/Router.svelte generated by Svelte v3.48.0 */

	const file$z = 'node_modules/svelte-navigator/src/Router.svelte';

	// (195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}
	function create_if_block$d(ctx) {
		let div;
		let t;

		const block = {
			c: function create() {
				div = element('div');
				t = text(/*$announcementText*/ ctx[0]);
				attr_dev(div, 'role', 'status');
				attr_dev(div, 'aria-atomic', 'true');
				attr_dev(div, 'aria-live', 'polite');
				attr_dev(div, 'style', visuallyHiddenStyle);
				add_location(div, file$z, 195, 1, 5906);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty[0] & /*$announcementText*/ 1) set_data_dev(t, /*$announcementText*/ ctx[0]);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$d.name,
			type: 'if',
			source: '(195:0) {#if isTopLevelRouter && manageFocus && a11yConfig.announcements}',
			ctx,
		});

		return block;
	}

	function create_fragment$C(ctx) {
		let div;
		let t0;
		let t1;
		let if_block_anchor;
		let current;
		const default_slot_template = /*#slots*/ ctx[20].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[19], null);
		let if_block =
			/*isTopLevelRouter*/ ctx[2] &&
			/*manageFocus*/ ctx[4] &&
			/*a11yConfig*/ ctx[1].announcements &&
			create_if_block$d(ctx);

		const block = {
			c: function create() {
				div = element('div');
				t0 = space();
				if (default_slot) default_slot.c();
				t1 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				set_style(div, 'display', 'none');
				attr_dev(div, 'aria-hidden', 'true');
				attr_dev(div, 'data-svnav-router', /*routerId*/ ctx[3]);
				add_location(div, file$z, 190, 0, 5750);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				insert_dev(target, t0, anchor);

				if (default_slot) {
					default_slot.m(target, anchor);
				}

				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty[0] & /*$$scope*/ 524288)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[19],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[19])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[19], dirty, null),
							null,
						);
					}
				}

				if (
					/*isTopLevelRouter*/ ctx[2] &&
					/*manageFocus*/ ctx[4] &&
					/*a11yConfig*/ ctx[1].announcements
				)
					if_block.p(ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (detaching) detach_dev(t0);
				if (default_slot) default_slot.d(detaching);
				if (detaching) detach_dev(t1);
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$C.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	const createId$1 = createCounter();
	const defaultBasepath = '/';

	function instance$C($$self, $$props, $$invalidate) {
		let $location;
		let $activeRoute;
		let $prevLocation;
		let $routes;
		let $announcementText;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Router', slots, ['default']);
		let { basepath = defaultBasepath } = $$props;
		let { url = null } = $$props;
		let { history = globalHistory } = $$props;
		let { primary = true } = $$props;
		let { a11y = {} } = $$props;

		const a11yConfig = {
			createAnnouncement: (route) => `Navigated to ${route.uri}`,
			announcements: true,
			...a11y,
		};

		// Remember the initial `basepath`, so we can fire a warning
		// when the user changes it later
		const initialBasepath = basepath;

		const normalizedBasepath = normalizePath(basepath);
		const locationContext = getContext(LOCATION);
		const routerContext = getContext(ROUTER);
		const isTopLevelRouter = !locationContext;
		const routerId = createId$1();
		const manageFocus = primary && !(routerContext && !routerContext.manageFocus);
		const announcementText = writable('');
		validate_store(announcementText, 'announcementText');
		component_subscribe($$self, announcementText, (value) =>
			$$invalidate(0, ($announcementText = value)),
		);
		const routes = writable([]);
		validate_store(routes, 'routes');
		component_subscribe($$self, routes, (value) => $$invalidate(18, ($routes = value)));
		const activeRoute = writable(null);
		validate_store(activeRoute, 'activeRoute');
		component_subscribe($$self, activeRoute, (value) => $$invalidate(16, ($activeRoute = value)));

		// Used in SSR to synchronously set that a Route is active.
		let hasActiveRoute = false;

		// Nesting level of router.
		// We will need this to identify sibling routers, when moving
		// focus on navigation, so we can focus the first possible router
		const level = isTopLevelRouter ? 0 : routerContext.level + 1;

		// If we're running an SSR we force the location to the `url` prop
		const getInitialLocation = () =>
			normalizeLocation(isSSR ? createLocation(url) : history.location, normalizedBasepath);

		const location = isTopLevelRouter ? writable(getInitialLocation()) : locationContext;

		validate_store(location, 'location');
		component_subscribe($$self, location, (value) => $$invalidate(15, ($location = value)));
		const prevLocation = writable($location);
		validate_store(prevLocation, 'prevLocation');
		component_subscribe($$self, prevLocation, (value) => $$invalidate(17, ($prevLocation = value)));
		const triggerFocus = createTriggerFocus(a11yConfig, announcementText, location);
		const createRouteFilter = (routeId) => (routeList) =>
			routeList.filter((routeItem) => routeItem.id !== routeId);

		function registerRoute(route) {
			if (isSSR) {
				// In SSR we should set the activeRoute immediately if it is a match.
				// If there are more Routes being registered after a match is found,
				// we just skip them.
				if (hasActiveRoute) {
					return;
				}

				const matchingRoute = match(route, $location.pathname);

				if (matchingRoute) {
					hasActiveRoute = true;

					// Return the match in SSR mode, so the matched Route can use it immediatly.
					// Waiting for activeRoute to update does not work, because it updates
					// after the Route is initialized
					return matchingRoute; // eslint-disable-line consistent-return
				}
			} else {
				routes.update((prevRoutes) => {
					// Remove an old version of the updated route,
					// before pushing the new version
					const nextRoutes = createRouteFilter(route.id)(prevRoutes);

					nextRoutes.push(route);
					return nextRoutes;
				});
			}
		}

		function unregisterRoute(routeId) {
			routes.update(createRouteFilter(routeId));
		}

		if (!isTopLevelRouter && basepath !== defaultBasepath) {
			warn(ROUTER_ID, 'Only top-level Routers can have a "basepath" prop. It is ignored.', {
				basepath,
			});
		}

		if (isTopLevelRouter) {
			// The topmost Router in the tree is responsible for updating
			// the location store and supplying it through context.
			onMount(() => {
				const unlisten = history.listen((changedHistory) => {
					const normalizedLocation = normalizeLocation(changedHistory.location, normalizedBasepath);
					prevLocation.set($location);
					location.set(normalizedLocation);
				});

				return unlisten;
			});

			setContext(LOCATION, location);
		}

		setContext(ROUTER, {
			activeRoute,
			registerRoute,
			unregisterRoute,
			manageFocus,
			level,
			id: routerId,
			history: isTopLevelRouter ? history : routerContext.history,
			basepath: isTopLevelRouter ? normalizedBasepath : routerContext.basepath,
		});

		const writable_props = ['basepath', 'url', 'history', 'primary', 'a11y'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Router> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('basepath' in $$props) $$invalidate(10, (basepath = $$props.basepath));
			if ('url' in $$props) $$invalidate(11, (url = $$props.url));
			if ('history' in $$props) $$invalidate(12, (history = $$props.history));
			if ('primary' in $$props) $$invalidate(13, (primary = $$props.primary));
			if ('a11y' in $$props) $$invalidate(14, (a11y = $$props.a11y));
			if ('$$scope' in $$props) $$invalidate(19, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({
			createCounter,
			createId: createId$1,
			getContext,
			setContext,
			onMount,
			writable,
			LOCATION,
			ROUTER,
			globalHistory,
			normalizePath,
			pick,
			match,
			normalizeLocation,
			createLocation,
			isSSR,
			warn,
			ROUTER_ID,
			pushFocusCandidate,
			visuallyHiddenStyle,
			createTriggerFocus,
			defaultBasepath,
			basepath,
			url,
			history,
			primary,
			a11y,
			a11yConfig,
			initialBasepath,
			normalizedBasepath,
			locationContext,
			routerContext,
			isTopLevelRouter,
			routerId,
			manageFocus,
			announcementText,
			routes,
			activeRoute,
			hasActiveRoute,
			level,
			getInitialLocation,
			location,
			prevLocation,
			triggerFocus,
			createRouteFilter,
			registerRoute,
			unregisterRoute,
			$location,
			$activeRoute,
			$prevLocation,
			$routes,
			$announcementText,
		});

		$$self.$inject_state = ($$props) => {
			if ('basepath' in $$props) $$invalidate(10, (basepath = $$props.basepath));
			if ('url' in $$props) $$invalidate(11, (url = $$props.url));
			if ('history' in $$props) $$invalidate(12, (history = $$props.history));
			if ('primary' in $$props) $$invalidate(13, (primary = $$props.primary));
			if ('a11y' in $$props) $$invalidate(14, (a11y = $$props.a11y));
			if ('hasActiveRoute' in $$props) hasActiveRoute = $$props.hasActiveRoute;
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty[0] & /*basepath*/ 1024) {
				if (basepath !== initialBasepath) {
					warn(ROUTER_ID, 'You cannot change the "basepath" prop. It is ignored.');
				}
			}

			if ($$self.$$.dirty[0] & /*$routes, $location*/ 294912) {
				// This reactive statement will be run when the Router is created
				// when there are no Routes and then again the following tick, so it
				// will not find an active Route in SSR and in the browser it will only
				// pick an active Route after all Routes have been registered.
				{
					const bestMatch = pick($routes, $location.pathname);
					activeRoute.set(bestMatch);
				}
			}

			if ($$self.$$.dirty[0] & /*$location, $prevLocation*/ 163840) {
				// Manage focus and announce navigation to screen reader users
				{
					if (isTopLevelRouter) {
						const hasHash = !!$location.hash;

						// When a hash is present in the url, we skip focus management, because
						// focusing a different element will prevent in-page jumps (See #3)
						const shouldManageFocus = !hasHash && manageFocus;

						// We don't want to make an announcement, when the hash changes,
						// but the active route stays the same
						const announceNavigation = !hasHash || $location.pathname !== $prevLocation.pathname;

						triggerFocus(shouldManageFocus, announceNavigation);
					}
				}
			}

			if ($$self.$$.dirty[0] & /*$activeRoute*/ 65536) {
				// Queue matched Route, so top level Router can decide which Route to focus.
				// Non primary Routers should just be ignored
				if (manageFocus && $activeRoute && $activeRoute.primary) {
					pushFocusCandidate({ level, routerId, route: $activeRoute });
				}
			}
		};

		return [
			$announcementText,
			a11yConfig,
			isTopLevelRouter,
			routerId,
			manageFocus,
			announcementText,
			routes,
			activeRoute,
			location,
			prevLocation,
			basepath,
			url,
			history,
			primary,
			a11y,
			$location,
			$activeRoute,
			$prevLocation,
			$routes,
			$$scope,
			slots,
		];
	}

	class Router extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(
				this,
				options,
				instance$C,
				create_fragment$C,
				safe_not_equal,
				{
					basepath: 10,
					url: 11,
					history: 12,
					primary: 13,
					a11y: 14,
				},
				null,
				[-1, -1],
			);

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Router',
				options,
				id: create_fragment$C.name,
			});
		}

		get basepath() {
			throw new Error(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set basepath(value) {
			throw new Error(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get url() {
			throw new Error(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set url(value) {
			throw new Error(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get history() {
			throw new Error(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set history(value) {
			throw new Error(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get primary() {
			throw new Error(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set primary(value) {
			throw new Error(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get a11y() {
			throw new Error(
				"<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set a11y(value) {
			throw new Error(
				"<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	var Router$1 = Router;

	/**
	 * Check if a component or hook have been created outside of a
	 * context providing component
	 * @param {number} componentId
	 * @param {*} props
	 * @param {string?} ctxKey
	 * @param {number?} ctxProviderId
	 */
	function usePreflightCheck(componentId, props, ctxKey = ROUTER, ctxProviderId = ROUTER_ID) {
		const ctx = getContext(ctxKey);
		if (!ctx) {
			fail(
				componentId,
				(label) => `You cannot use ${label} outside of a ${createLabel(ctxProviderId)}.`,
				props,
			);
		}
	}

	const toReadonly = (ctx) => {
		const { subscribe } = getContext(ctx);
		return { subscribe };
	};

	/**
     * Access the current location via a readable store.
     * @returns {import("svelte/store").Readable<{
        pathname: string;
        search: string;
        hash: string;
        state: {};
      }>}
     *
     * @example
      ```html
      <script>
        import { useLocation } from "svelte-navigator";

        const location = useLocation();

        $: console.log($location);
        // {
        //   pathname: "/blog",
        //   search: "?id=123",
        //   hash: "#comments",
        //   state: {}
        // }
      </script>
      ```
     */
	function useLocation() {
		usePreflightCheck(USE_LOCATION_ID);
		return toReadonly(LOCATION);
	}

	/**
     * @typedef {{
        path: string;
        fullPath: string;
        uri: string;
        params: {};
      }} RouteMatch
     */

	/**
	 * @typedef {import("svelte/store").Readable<RouteMatch|null>} RouteMatchStore
	 */

	/**
	 * Access the history of top level Router.
	 */
	function useHistory() {
		const { history } = getContext(ROUTER);
		return history;
	}

	/**
	 * Access the base of the parent Route.
	 */
	function useRouteBase() {
		const route = getContext(ROUTE);
		return route ? derived(route, (_route) => _route.base) : writable('/');
	}

	/**
     * Resolve a given link relative to the current `Route` and the `Router`s `basepath`.
     * It is used under the hood in `Link` and `useNavigate`.
     * You can use it to manually resolve links, when using the `link` or `links` actions.
     *
     * @returns {(path: string) => string}
     *
     * @example
      ```html
      <script>
        import { link, useResolve } from "svelte-navigator";

        const resolve = useResolve();
        // `resolvedLink` will be resolved relative to its parent Route
        // and the Routers `basepath`
        const resolvedLink = resolve("relativePath");
      </script>

      <a href={resolvedLink} use:link>Relative link</a>
      ```
     */
	function useResolve() {
		usePreflightCheck(USE_RESOLVE_ID);
		const routeBase = useRouteBase();
		const { basepath: appBase } = getContext(ROUTER);
		/**
		 * Resolves the path relative to the current route and basepath.
		 *
		 * @param {string} path The path to resolve
		 * @returns {string} The resolved path
		 */
		const resolve = (path) => resolveLink(path, get_store_value(routeBase), appBase);
		return resolve;
	}

	/**
     * A hook, that returns a context-aware version of `navigate`.
     * It will automatically resolve the given link relative to the current Route.
     * It will also resolve a link against the `basepath` of the Router.
     *
     * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router>
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /absolutePath
      </button>
      ```
      *
      * @example
      ```html
      <!-- App.svelte -->
      <script>
        import { link, Route } from "svelte-navigator";
        import RouteComponent from "./RouteComponent.svelte";
      </script>

      <Router basepath="/base">
        <Route path="route1">
          <RouteComponent />
        </Route>
        <!-- ... -->
      </Router>

      <!-- RouteComponent.svelte -->
      <script>
        import { useNavigate } from "svelte-navigator";

        const navigate = useNavigate();
      </script>

      <button on:click="{() => navigate('relativePath')}">
        go to /base/route1/relativePath
      </button>
      <button on:click="{() => navigate('/absolutePath')}">
        go to /base/absolutePath
      </button>
      ```
     */
	function useNavigate() {
		usePreflightCheck(USE_NAVIGATE_ID);
		const resolve = useResolve();
		const { navigate } = useHistory();
		/**
		 * Navigate to a new route.
		 * Resolves the link relative to the current route and basepath.
		 *
		 * @param {string|number} to The path to navigate to.
		 *
		 * If `to` is a number we will navigate to the stack entry index + `to`
		 * (-> `navigate(-1)`, is equivalent to hitting the back button of the browser)
		 * @param {Object} options
		 * @param {*} [options.state]
		 * @param {boolean} [options.replace=false]
		 */
		const navigateRelative = (to, options) => {
			// If to is a number, we navigate to the target stack entry via `history.go`.
			// Otherwise resolve the link
			const target = isNumber(to) ? to : resolve(to);
			return navigate(target, options);
		};
		return navigateRelative;
	}

	/* node_modules/svelte-navigator/src/Route.svelte generated by Svelte v3.48.0 */
	const file$y = 'node_modules/svelte-navigator/src/Route.svelte';

	const get_default_slot_changes = (dirty) => ({
		params: dirty & /*$params*/ 16,
		location: dirty & /*$location*/ 8,
	});

	const get_default_slot_context = (ctx) => ({
		params: isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
		location: /*$location*/ ctx[3],
		navigate: /*navigate*/ ctx[10],
	});

	// (97:0) {#if isActive}
	function create_if_block$c(ctx) {
		let router;
		let current;

		router = new Router$1({
			props: {
				primary: /*primary*/ ctx[1],
				$$slots: { default: [create_default_slot$9] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(router.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(router, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const router_changes = {};
				if (dirty & /*primary*/ 2) router_changes.primary = /*primary*/ ctx[1];

				if (dirty & /*$$scope, component, $location, $params, $$restProps*/ 264217) {
					router_changes.$$scope = { dirty, ctx };
				}

				router.$set(router_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(router, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$c.name,
			type: 'if',
			source: '(97:0) {#if isActive}',
			ctx,
		});

		return block;
	}

	// (113:2) {:else}
	function create_else_block$3(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[17].default;
		const default_slot = create_slot(
			default_slot_template,
			ctx,
			/*$$scope*/ ctx[18],
			get_default_slot_context,
		);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope, $params, $location*/ 262168)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[18],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[18])
								: get_slot_changes(
										default_slot_template,
										/*$$scope*/ ctx[18],
										dirty,
										get_default_slot_changes,
								  ),
							get_default_slot_context,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block$3.name,
			type: 'else',
			source: '(113:2) {:else}',
			ctx,
		});

		return block;
	}

	// (105:2) {#if component !== null}
	function create_if_block_1$5(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;

		const switch_instance_spread_levels = [
			{ location: /*$location*/ ctx[3] },
			{ navigate: /*navigate*/ ctx[10] },
			isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
			/*$$restProps*/ ctx[11],
		];

		var switch_value = /*component*/ ctx[0];

		function switch_props(ctx) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			return {
				props: switch_instance_props,
				$$inline: true,
			};
		}

		if (switch_value) {
			switch_instance = new switch_value(switch_props());
		}

		const block = {
			c: function create() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m: function mount(target, anchor) {
				if (switch_instance) {
					mount_component(switch_instance, target, anchor);
				}

				insert_dev(target, switch_instance_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const switch_instance_changes =
					dirty & /*$location, navigate, isSSR, get, params, $params, $$restProps*/ 3608
						? get_spread_update(switch_instance_spread_levels, [
								dirty & /*$location*/ 8 && { location: /*$location*/ ctx[3] },
								dirty & /*navigate*/ 1024 && { navigate: /*navigate*/ ctx[10] },
								dirty & /*isSSR, get, params, $params*/ 528 &&
									get_spread_object(
										isSSR ? get_store_value(/*params*/ ctx[9]) : /*$params*/ ctx[4],
									),
								dirty & /*$$restProps*/ 2048 && get_spread_object(/*$$restProps*/ ctx[11]),
						  ])
						: {};

				if (switch_value !== (switch_value = /*component*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = new switch_value(switch_props());
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(
							switch_instance,
							switch_instance_anchor.parentNode,
							switch_instance_anchor,
						);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					switch_instance.$set(switch_instance_changes);
				}
			},
			i: function intro(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(switch_instance_anchor);
				if (switch_instance) destroy_component(switch_instance, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1$5.name,
			type: 'if',
			source: '(105:2) {#if component !== null}',
			ctx,
		});

		return block;
	}

	// (98:1) <Router {primary}>
	function create_default_slot$9(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block_1$5, create_else_block$3];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*component*/ ctx[0] !== null) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] =
			if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if_blocks[current_block_type_index].p(ctx, dirty);
				} else {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] =
							if_block_creators[current_block_type_index](ctx);
						if_block.c();
					} else {
						if_block.p(ctx, dirty);
					}

					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$9.name,
			type: 'slot',
			source: '(98:1) <Router {primary}>',
			ctx,
		});

		return block;
	}

	function create_fragment$B(ctx) {
		let div0;
		let t0;
		let t1;
		let div1;
		let current;
		let if_block = /*isActive*/ ctx[2] && create_if_block$c(ctx);

		const block = {
			c: function create() {
				div0 = element('div');
				t0 = space();
				if (if_block) if_block.c();
				t1 = space();
				div1 = element('div');
				set_style(div0, 'display', 'none');
				attr_dev(div0, 'aria-hidden', 'true');
				attr_dev(div0, 'data-svnav-route-start', /*id*/ ctx[5]);
				add_location(div0, file$y, 95, 0, 2622);
				set_style(div1, 'display', 'none');
				attr_dev(div1, 'aria-hidden', 'true');
				attr_dev(div1, 'data-svnav-route-end', /*id*/ ctx[5]);
				add_location(div1, file$y, 121, 0, 3295);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				insert_dev(target, t0, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, div1, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*isActive*/ ctx[2]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*isActive*/ 4) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$c(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(t1.parentNode, t1);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
				if (detaching) detach_dev(t0);
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(t1);
				if (detaching) detach_dev(div1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$B.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	const createId = createCounter();

	function instance$B($$self, $$props, $$invalidate) {
		let isActive;
		const omit_props_names = ['path', 'component', 'meta', 'primary'];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let $activeRoute;
		let $location;
		let $parentBase;
		let $params;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Route', slots, ['default']);
		let { path = '' } = $$props;
		let { component = null } = $$props;
		let { meta = {} } = $$props;
		let { primary = true } = $$props;
		usePreflightCheck(ROUTE_ID, $$props);
		const id = createId();
		const { registerRoute, unregisterRoute, activeRoute } = getContext(ROUTER);
		validate_store(activeRoute, 'activeRoute');
		component_subscribe($$self, activeRoute, (value) => $$invalidate(15, ($activeRoute = value)));
		const parentBase = useRouteBase();
		validate_store(parentBase, 'parentBase');
		component_subscribe($$self, parentBase, (value) => $$invalidate(16, ($parentBase = value)));
		const location = useLocation();
		validate_store(location, 'location');
		component_subscribe($$self, location, (value) => $$invalidate(3, ($location = value)));
		const focusElement = writable(null);

		// In SSR we cannot wait for $activeRoute to update,
		// so we use the match returned from `registerRoute` instead
		let ssrMatch;

		const route = writable();
		const params = writable({});
		validate_store(params, 'params');
		component_subscribe($$self, params, (value) => $$invalidate(4, ($params = value)));
		setContext(ROUTE, route);
		setContext(ROUTE_PARAMS, params);
		setContext(FOCUS_ELEM, focusElement);

		// We need to call useNavigate after the route is set,
		// so we can use the routes path for link resolution
		const navigate = useNavigate();

		// There is no need to unregister Routes in SSR since it will all be
		// thrown away anyway
		if (!isSSR) {
			onDestroy(() => unregisterRoute(id));
		}

		$$self.$$set = ($$new_props) => {
			$$invalidate(
				23,
				($$props = assign(assign({}, $$props), exclude_internal_props($$new_props))),
			);
			$$invalidate(11, ($$restProps = compute_rest_props($$props, omit_props_names)));
			if ('path' in $$new_props) $$invalidate(12, (path = $$new_props.path));
			if ('component' in $$new_props) $$invalidate(0, (component = $$new_props.component));
			if ('meta' in $$new_props) $$invalidate(13, (meta = $$new_props.meta));
			if ('primary' in $$new_props) $$invalidate(1, (primary = $$new_props.primary));
			if ('$$scope' in $$new_props) $$invalidate(18, ($$scope = $$new_props.$$scope));
		};

		$$self.$capture_state = () => ({
			createCounter,
			createId,
			getContext,
			onDestroy,
			setContext,
			writable,
			get: get_store_value,
			Router: Router$1,
			ROUTER,
			ROUTE,
			ROUTE_PARAMS,
			FOCUS_ELEM,
			useLocation,
			useNavigate,
			useRouteBase,
			usePreflightCheck,
			isSSR,
			extractBaseUri,
			join,
			ROUTE_ID,
			path,
			component,
			meta,
			primary,
			id,
			registerRoute,
			unregisterRoute,
			activeRoute,
			parentBase,
			location,
			focusElement,
			ssrMatch,
			route,
			params,
			navigate,
			isActive,
			$activeRoute,
			$location,
			$parentBase,
			$params,
		});

		$$self.$inject_state = ($$new_props) => {
			$$invalidate(23, ($$props = assign(assign({}, $$props), $$new_props)));
			if ('path' in $$props) $$invalidate(12, (path = $$new_props.path));
			if ('component' in $$props) $$invalidate(0, (component = $$new_props.component));
			if ('meta' in $$props) $$invalidate(13, (meta = $$new_props.meta));
			if ('primary' in $$props) $$invalidate(1, (primary = $$new_props.primary));
			if ('ssrMatch' in $$props) $$invalidate(14, (ssrMatch = $$new_props.ssrMatch));
			if ('isActive' in $$props) $$invalidate(2, (isActive = $$new_props.isActive));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*path, $parentBase, meta, $location, primary*/ 77834) {
				{
					// The route store will be re-computed whenever props, location or parentBase change
					const isDefault = path === '';

					const rawBase = join($parentBase, path);

					const updatedRoute = {
						id,
						path,
						meta,
						// If no path prop is given, this Route will act as the default Route
						// that is rendered if no other Route in the Router is a match
						default: isDefault,
						fullPath: isDefault ? '' : rawBase,
						base: isDefault ? $parentBase : extractBaseUri(rawBase, $location.pathname),
						primary,
						focusElement,
					};

					route.set(updatedRoute);

					// If we're in SSR mode and the Route matches,
					// `registerRoute` will return the match
					$$invalidate(14, (ssrMatch = registerRoute(updatedRoute)));
				}
			}

			if ($$self.$$.dirty & /*ssrMatch, $activeRoute*/ 49152) {
				$$invalidate(2, (isActive = !!(ssrMatch || ($activeRoute && $activeRoute.id === id))));
			}

			if ($$self.$$.dirty & /*isActive, ssrMatch, $activeRoute*/ 49156) {
				if (isActive) {
					const { params: activeParams } = ssrMatch || $activeRoute;
					params.set(activeParams);
				}
			}
		};

		$$props = exclude_internal_props($$props);

		return [
			component,
			primary,
			isActive,
			$location,
			$params,
			id,
			activeRoute,
			parentBase,
			location,
			params,
			navigate,
			$$restProps,
			path,
			meta,
			ssrMatch,
			$activeRoute,
			$parentBase,
			slots,
			$$scope,
		];
	}

	class Route extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$B, create_fragment$B, safe_not_equal, {
				path: 12,
				component: 0,
				meta: 13,
				primary: 1,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Route',
				options,
				id: create_fragment$B.name,
			});
		}

		get path() {
			throw new Error(
				"<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set path(value) {
			throw new Error(
				"<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get component() {
			throw new Error(
				"<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set component(value) {
			throw new Error(
				"<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get meta() {
			throw new Error(
				"<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set meta(value) {
			throw new Error(
				"<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get primary() {
			throw new Error(
				"<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set primary(value) {
			throw new Error(
				"<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	var Route$1 = Route;

	/* node_modules/svelte-navigator/src/Link.svelte generated by Svelte v3.48.0 */
	const file$x = 'node_modules/svelte-navigator/src/Link.svelte';

	function create_fragment$A(ctx) {
		let a;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[13].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[12], null);
		let a_levels = [{ href: /*href*/ ctx[0] }, /*ariaCurrent*/ ctx[2], /*props*/ ctx[1]];
		let a_data = {};

		for (let i = 0; i < a_levels.length; i += 1) {
			a_data = assign(a_data, a_levels[i]);
		}

		const block = {
			c: function create() {
				a = element('a');
				if (default_slot) default_slot.c();
				set_attributes(a, a_data);
				add_location(a, file$x, 63, 0, 1735);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, a, anchor);

				if (default_slot) {
					default_slot.m(a, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(a, 'click', /*onClick*/ ctx[4], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 4096)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[12],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[12])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[12], dirty, null),
							null,
						);
					}
				}

				set_attributes(
					a,
					(a_data = get_spread_update(a_levels, [
						(!current || dirty & /*href*/ 1) && { href: /*href*/ ctx[0] },
						dirty & /*ariaCurrent*/ 4 && /*ariaCurrent*/ ctx[2],
						dirty & /*props*/ 2 && /*props*/ ctx[1],
					])),
				);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(a);
				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$A.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$A($$self, $$props, $$invalidate) {
		let href;
		let isPartiallyCurrent;
		let isCurrent;
		let ariaCurrent;
		let props;
		const omit_props_names = ['to', 'replace', 'state', 'getProps'];
		let $$restProps = compute_rest_props($$props, omit_props_names);
		let $location;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Link', slots, ['default']);
		let { to } = $$props;
		let { replace = false } = $$props;
		let { state = {} } = $$props;
		let { getProps = null } = $$props;
		usePreflightCheck(LINK_ID, $$props);
		const location = useLocation();
		validate_store(location, 'location');
		component_subscribe($$self, location, (value) => $$invalidate(11, ($location = value)));
		const dispatch = createEventDispatcher();
		const resolve = useResolve();
		const { navigate } = useHistory();

		function onClick(event) {
			dispatch('click', event);

			if (shouldNavigate(event)) {
				event.preventDefault();

				// Don't push another entry to the history stack when the user
				// clicks on a Link to the page they are currently on.
				const shouldReplace = isCurrent || replace;

				navigate(href, { state, replace: shouldReplace });
			}
		}

		$$self.$$set = ($$new_props) => {
			$$invalidate(
				18,
				($$props = assign(assign({}, $$props), exclude_internal_props($$new_props))),
			);
			$$invalidate(17, ($$restProps = compute_rest_props($$props, omit_props_names)));
			if ('to' in $$new_props) $$invalidate(5, (to = $$new_props.to));
			if ('replace' in $$new_props) $$invalidate(6, (replace = $$new_props.replace));
			if ('state' in $$new_props) $$invalidate(7, (state = $$new_props.state));
			if ('getProps' in $$new_props) $$invalidate(8, (getProps = $$new_props.getProps));
			if ('$$scope' in $$new_props) $$invalidate(12, ($$scope = $$new_props.$$scope));
		};

		$$self.$capture_state = () => ({
			createEventDispatcher,
			useLocation,
			useResolve,
			useHistory,
			usePreflightCheck,
			shouldNavigate,
			isFunction,
			startsWith,
			LINK_ID,
			to,
			replace,
			state,
			getProps,
			location,
			dispatch,
			resolve,
			navigate,
			onClick,
			href,
			isCurrent,
			isPartiallyCurrent,
			props,
			ariaCurrent,
			$location,
		});

		$$self.$inject_state = ($$new_props) => {
			$$invalidate(18, ($$props = assign(assign({}, $$props), $$new_props)));
			if ('to' in $$props) $$invalidate(5, (to = $$new_props.to));
			if ('replace' in $$props) $$invalidate(6, (replace = $$new_props.replace));
			if ('state' in $$props) $$invalidate(7, (state = $$new_props.state));
			if ('getProps' in $$props) $$invalidate(8, (getProps = $$new_props.getProps));
			if ('href' in $$props) $$invalidate(0, (href = $$new_props.href));
			if ('isCurrent' in $$props) $$invalidate(9, (isCurrent = $$new_props.isCurrent));
			if ('isPartiallyCurrent' in $$props)
				$$invalidate(10, (isPartiallyCurrent = $$new_props.isPartiallyCurrent));
			if ('props' in $$props) $$invalidate(1, (props = $$new_props.props));
			if ('ariaCurrent' in $$props) $$invalidate(2, (ariaCurrent = $$new_props.ariaCurrent));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*to, $location*/ 2080) {
				// We need to pass location here to force re-resolution of the link,
				// when the pathname changes. Otherwise we could end up with stale path params,
				// when for example an :id changes in the parent Routes path
				$$invalidate(0, (href = resolve(to, $location)));
			}

			if ($$self.$$.dirty & /*$location, href*/ 2049) {
				$$invalidate(10, (isPartiallyCurrent = startsWith($location.pathname, href)));
			}

			if ($$self.$$.dirty & /*href, $location*/ 2049) {
				$$invalidate(9, (isCurrent = href === $location.pathname));
			}

			if ($$self.$$.dirty & /*isCurrent*/ 512) {
				$$invalidate(2, (ariaCurrent = isCurrent ? { 'aria-current': 'page' } : {}));
			}

			$$invalidate(
				1,
				(props = (() => {
					if (isFunction(getProps)) {
						const dynamicProps = getProps({
							location: $location,
							href,
							isPartiallyCurrent,
							isCurrent,
						});

						return { ...$$restProps, ...dynamicProps };
					}

					return $$restProps;
				})()),
			);
		};

		$$props = exclude_internal_props($$props);

		return [
			href,
			props,
			ariaCurrent,
			location,
			onClick,
			to,
			replace,
			state,
			getProps,
			isCurrent,
			isPartiallyCurrent,
			$location,
			$$scope,
			slots,
		];
	}

	class Link extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$A, create_fragment$A, safe_not_equal, {
				to: 5,
				replace: 6,
				state: 7,
				getProps: 8,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Link',
				options,
				id: create_fragment$A.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*to*/ ctx[5] === undefined && !('to' in props)) {
				console.warn("<Link> was created without expected prop 'to'");
			}
		}

		get to() {
			throw new Error(
				"<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set to(value) {
			throw new Error(
				"<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get replace() {
			throw new Error(
				"<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set replace(value) {
			throw new Error(
				"<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get state() {
			throw new Error(
				"<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set state(value) {
			throw new Error(
				"<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get getProps() {
			throw new Error(
				"<Link>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set getProps(value) {
			throw new Error(
				"<Link>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	var Link$1 = Link;

	/* src/Ethereum.svelte generated by Svelte v3.48.0 */

	const file$w = 'src/Ethereum.svelte';

	function create_fragment$z(ctx) {
		let span;

		const block = {
			c: function create() {
				span = element('span');
				span.textContent = 'Ξ';
				attr_dev(span, 'class', 'svelte-ajazop');
				add_location(span, file$w, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, span, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(span);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$z.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$z($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Ethereum', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Ethereum> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class Ethereum extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$z, create_fragment$z, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Ethereum',
				options,
				id: create_fragment$z.name,
			});
		}
	}

	/* src/Wallet.svelte generated by Svelte v3.48.0 */
	const file$v = 'src/Wallet.svelte';

	function create_fragment$y(ctx) {
		let div;
		let p0;
		let t1;
		let p1;
		let eth;
		let t2;
		let current;
		eth = new Ethereum({ $$inline: true });

		const block = {
			c: function create() {
				div = element('div');
				p0 = element('p');
				p0.textContent = 'some.eth';
				t1 = space();
				p1 = element('p');
				create_component(eth.$$.fragment);
				t2 = text('0.5');
				attr_dev(p0, 'class', 'svelte-ai5zyf');
				add_location(p0, file$v, 5, 2, 67);
				attr_dev(p1, 'class', 'svelte-ai5zyf');
				add_location(p1, file$v, 6, 2, 85);
				attr_dev(div, 'class', 'svelte-ai5zyf');
				add_location(div, file$v, 4, 0, 59);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, p0);
				append_dev(div, t1);
				append_dev(div, p1);
				mount_component(eth, p1, null);
				append_dev(p1, t2);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(eth.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eth.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(eth);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$y.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$y($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Wallet', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Wallet> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ ETH: Ethereum });
		return [];
	}

	class Wallet extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$y, create_fragment$y, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Wallet',
				options,
				id: create_fragment$y.name,
			});
		}
	}

	var pathsByName = {
		twitter: [
			'M928 254.3c-30.6 13.2-63.9 22.7-98.2 26.4a170.1 170.1 0 0075-94 336.64 336.64 0 01-108.2 41.2A170.1 170.1 0 00672 174c-94.5 0-170.5 76.6-170.5 170.6 0 13.2 1.6 26.4 4.2 39.1-141.5-7.4-267.7-75-351.6-178.5a169.32 169.32 0 00-23.2 86.1c0 59.2 30.1 111.4 76 142.1a172 172 0 01-77.1-21.7v2.1c0 82.9 58.6 151.6 136.7 167.4a180.6 180.6 0 01-44.9 5.8c-11.1 0-21.6-1.1-32.2-2.6C211 652 273.9 701.1 348.8 702.7c-58.6 45.9-132 72.9-211.7 72.9-14.3 0-27.5-.5-41.2-2.1C171.5 822 261.2 850 357.8 850 671.4 850 843 590.2 843 364.7c0-7.4 0-14.8-.5-22.2 33.2-24.3 62.3-54.4 85.5-88.2z',
		],
		fileImage: [
			'M553.1 509.1l-77.8 99.2-41.1-52.4a8 8 0 00-12.6 0l-99.8 127.2a7.98 7.98 0 006.3 12.9H696c6.7 0 10.4-7.7 6.3-12.9l-136.5-174a8.1 8.1 0 00-12.7 0zM360 442a40 40 0 1080 0 40 40 0 10-80 0zm494.6-153.4L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494z',
		],
		checkCircle: [
			'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z',
		],
		caret: [
			'M715.8 493.5L335 165.1c-14.2-12.2-35-1.2-35 18.5v656.8c0 19.7 20.8 30.7 35 18.5l380.8-328.4c10.9-9.4 10.9-27.6 0-37z',
		],
		infoCircle: [
			'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z',
			'M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z',
		],
		questionCircle: [
			'M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z',
			'M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z',
		],
		crown: [
			'M899.6 276.5L705 396.4 518.4 147.5a8.06 8.06 0 00-12.9 0L319 396.4 124.3 276.5c-5.7-3.5-13.1 1.2-12.2 7.9L188.5 865c1.1 7.9 7.9 14 16 14h615.1c8 0 14.9-6 15.9-14l76.4-580.6c.8-6.7-6.5-11.4-12.3-7.9zM512 734.2c-62.1 0-112.6-50.5-112.6-112.6S449.9 509 512 509s112.6 50.5 112.6 112.6S574.1 734.2 512 734.2zm0-160.9c-26.6 0-48.2 21.6-48.2 48.3 0 26.6 21.6 48.3 48.2 48.3s48.2-21.6 48.2-48.3c0-26.6-21.6-48.3-48.2-48.3z',
		],
	};

	/* src/Icon.svelte generated by Svelte v3.48.0 */

	const { Object: Object_1$2 } = globals;
	const file$u = 'src/Icon.svelte';

	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[4] = list[i];
		return child_ctx;
	}

	// (72:26)
	function create_if_block_3$1(ctx) {
		let svg;
		let path;

		const block = {
			c: function create() {
				svg = svg_element('svg');
				path = svg_element('path');
				attr_dev(path, 'fill-rule', 'evenodd');
				attr_dev(path, 'clip-rule', 'evenodd');
				attr_dev(
					path,
					'd',
					'M4.1534 13.6089L4.15362 13.61C4.77322 16.8113 7.42207 19.3677 10.647 19.8853L10.6502 19.8858C13.0412 20.2736 15.2625 19.6103 16.9422 18.2833C11.3549 16.2878 7.9748 10.3524 9.26266 4.48816C5.69846 5.77194 3.35817 9.51245 4.1534 13.6089ZM10.0083 2.21054C4.76622 3.2533 1.09895 8.36947 2.19006 13.9901C2.97006 18.0201 6.28006 21.2101 10.3301 21.8601C13.8512 22.4311 17.0955 21.1608 19.2662 18.8587C19.2765 18.8478 19.2866 18.837 19.2968 18.8261C19.4385 18.6745 19.5757 18.5184 19.7079 18.3581C19.7105 18.355 19.713 18.3519 19.7156 18.3487C19.8853 18.1426 20.0469 17.9295 20.2001 17.7101C20.4101 17.4001 20.2401 16.9601 19.8701 16.9201C19.5114 16.8796 19.1602 16.8209 18.817 16.7452C18.7964 16.7406 18.7758 16.736 18.7552 16.7313C18.6676 16.7114 18.5804 16.6903 18.4938 16.6681C18.4919 16.6676 18.4901 16.6672 18.4882 16.6667C13.0234 15.2647 9.72516 9.48006 11.4542 4.03417C11.4549 4.03214 11.4555 4.03012 11.4562 4.0281C11.4875 3.92954 11.5205 3.83109 11.5552 3.73278C11.5565 3.72911 11.5578 3.72543 11.5591 3.72175C11.6768 3.38921 11.8136 3.05829 11.9701 2.73005C12.1301 2.39005 11.8501 2.01005 11.4701 2.03005C11.1954 2.04379 10.924 2.06848 10.6561 2.10368C10.6517 2.10427 10.6472 2.10486 10.6428 2.10545C10.4413 2.13221 10.2418 2.16492 10.0446 2.2034C10.0325 2.20576 10.0204 2.20814 10.0083 2.21054Z',
				);
				add_location(path, file$u, 79, 5, 5117);
				attr_dev(svg, 'id', 'moon');
				attr_dev(svg, 'viewBox', '0 0 24 24');
				attr_dev(svg, 'width', '18');
				attr_dev(svg, 'height', '18');
				attr_dev(svg, 'fill', 'currentColor');
				attr_dev(svg, 'xmlns', 'http://www.w3.org/2000/svg');
				attr_dev(svg, 'class', 'svelte-1maum1v');
				add_location(svg, file$u, 72, 2, 4975);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(svg);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_3$1.name,
			type: 'if',
			source: '(72:26) ',
			ctx,
		});

		return block;
	}

	// (48:25)
	function create_if_block_2$3(ctx) {
		let svg;
		let path0;
		let path1;
		let path2;
		let path3;
		let path4;
		let path5;
		let path6;
		let path7;
		let path8;

		const block = {
			c: function create() {
				svg = svg_element('svg');
				path0 = svg_element('path');
				path1 = svg_element('path');
				path2 = svg_element('path');
				path3 = svg_element('path');
				path4 = svg_element('path');
				path5 = svg_element('path');
				path6 = svg_element('path');
				path7 = svg_element('path');
				path8 = svg_element('path');
				attr_dev(
					path0,
					'd',
					'M5.66 4.2L6.05 4.59C6.44 4.97 6.44 5.61 6.05 5.99L6.04 6C5.65 6.39 5.03 6.39 4.64 6L4.25 5.61C3.86 5.23 3.86 4.6 4.25 4.21L4.26 4.2C4.64 3.82 5.27 3.81 5.66 4.2Z',
				);
				add_location(path0, file$u, 49, 5, 3181);
				attr_dev(
					path1,
					'd',
					'M1.99 10.95H3.01C3.56 10.95 4 11.39 4 11.95V11.96C4 12.51 3.56 12.95 3 12.94H1.99C1.44 12.94 1 12.5 1 11.95V11.94C1 11.39 1.44 10.95 1.99 10.95Z',
				);
				add_location(path1, file$u, 51, 6, 3365);
				attr_dev(
					path2,
					'd',
					'M12 1H12.01C12.56 1 13 1.44 13 1.99V2.96C13 3.51 12.56 3.95 12 3.94H11.99C11.44 3.94 11 3.5 11 2.95V1.99C11 1.44 11.44 1 12 1Z',
				);
				add_location(path2, file$u, 53, 6, 3532);
				attr_dev(
					path3,
					'd',
					'M18.34 4.2C18.73 3.82 19.36 3.82 19.75 4.21C20.14 4.6 20.14 5.22 19.75 5.61L19.36 6C18.98 6.39 18.35 6.39 17.96 6L17.95 5.99C17.56 5.61 17.56 4.98 17.95 4.59L18.34 4.2Z',
				);
				add_location(path3, file$u, 55, 6, 3681);
				attr_dev(
					path4,
					'd',
					'M18.33 19.7L17.94 19.31C17.55 18.92 17.55 18.3 17.95 17.9C18.33 17.52 18.96 17.51 19.35 17.9L19.74 18.29C20.13 18.68 20.13 19.31 19.74 19.7C19.35 20.09 18.72 20.09 18.33 19.7Z',
				);
				add_location(path4, file$u, 57, 6, 3872);
				attr_dev(
					path5,
					'd',
					'M20 11.95V11.94C20 11.39 20.44 10.95 20.99 10.95H22C22.55 10.95 22.99 11.39 22.99 11.94V11.95C22.99 12.5 22.55 12.94 22 12.94H20.99C20.44 12.94 20 12.5 20 11.95Z',
				);
				add_location(path5, file$u, 59, 6, 4070);
				attr_dev(path6, 'fill-rule', 'evenodd');
				attr_dev(path6, 'clip-rule', 'evenodd');
				attr_dev(
					path6,
					'd',
					'M6 11.95C6 8.64 8.69 5.95 12 5.95C15.31 5.95 18 8.64 18 11.95C18 15.26 15.31 17.95 12 17.95C8.69 17.95 6 15.26 6 11.95ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z',
				);
				add_location(path6, file$u, 61, 6, 4254);
				attr_dev(
					path7,
					'd',
					'M12 22.9H11.99C11.44 22.9 11 22.46 11 21.91V20.95C11 20.4 11.44 19.96 11.99 19.96H12C12.55 19.96 12.99 20.4 12.99 20.95V21.91C12.99 22.46 12.55 22.9 12 22.9Z',
				);
				add_location(path7, file$u, 65, 6, 4561);
				attr_dev(
					path8,
					'd',
					'M5.66 19.69C5.27 20.08 4.64 20.08 4.25 19.69C3.86 19.3 3.86 18.68 4.24 18.28L4.63 17.89C5.02 17.5 5.65 17.5 6.04 17.89L6.05 17.9C6.43 18.28 6.44 18.91 6.05 19.3L5.66 19.69Z',
				);
				add_location(path8, file$u, 67, 6, 4741);
				attr_dev(svg, 'id', 'sun');
				attr_dev(svg, 'viewBox', '0 0 24 24');
				attr_dev(svg, 'width', '18');
				attr_dev(svg, 'height', '18');
				attr_dev(svg, 'fill', 'currentColor');
				attr_dev(svg, 'class', 'svelte-1maum1v');
				add_location(svg, file$u, 48, 2, 3099);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, path0);
				append_dev(svg, path1);
				append_dev(svg, path2);
				append_dev(svg, path3);
				append_dev(svg, path4);
				append_dev(svg, path5);
				append_dev(svg, path6);
				append_dev(svg, path7);
				append_dev(svg, path8);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(svg);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_2$3.name,
			type: 'if',
			source: '(48:25) ',
			ctx,
		});

		return block;
	}

	// (30:29)
	function create_if_block_1$4(ctx) {
		let svg;
		let g;
		let path;
		let defs;
		let clipPath;
		let rect;

		const block = {
			c: function create() {
				svg = svg_element('svg');
				g = svg_element('g');
				path = svg_element('path');
				defs = svg_element('defs');
				clipPath = svg_element('clipPath');
				rect = svg_element('rect');
				attr_dev(
					path,
					'd',
					'M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z',
				);
				attr_dev(path, 'fill', 'currentColor');
				add_location(path, file$u, 37, 7, 1036);
				attr_dev(g, 'clip-path', 'url(#clip0)');
				add_location(g, file$u, 36, 5, 1002);
				attr_dev(rect, 'width', '71');
				attr_dev(rect, 'height', '55');
				attr_dev(rect, 'fill', 'currentColor');
				add_location(rect, file$u, 43, 9, 2980);
				attr_dev(clipPath, 'id', 'clip0');
				add_location(clipPath, file$u, 42, 7, 2950);
				add_location(defs, file$u, 41, 5, 2937);
				attr_dev(svg, 'width', '71');
				attr_dev(svg, 'height', '55');
				attr_dev(svg, 'viewBox', '0 0 71 55');
				attr_dev(svg, 'fill', 'none');
				set_style(svg, 'height', '13px');
				set_style(svg, 'width', '16.7818px');
				attr_dev(svg, 'class', 'svelte-1maum1v');
				add_location(svg, file$u, 30, 2, 877);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, g);
				append_dev(g, path);
				append_dev(svg, defs);
				append_dev(defs, clipPath);
				append_dev(clipPath, rect);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(svg);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1$4.name,
			type: 'if',
			source: '(30:29) ',
			ctx,
		});

		return block;
	}

	// (16:0) {#if paths.length}
	function create_if_block$b(ctx) {
		let svg;
		let t;
		let svg_style_value;
		let each_value = /*paths*/ ctx[2];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
		}

		const block = {
			c: function create() {
				svg = svg_element('svg');
				t = text('>\n    ');

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(svg, 'width', '1em');
				attr_dev(svg, 'height', '1em');
				attr_dev(svg, 'viewBox', '64 64 896 896');
				attr_dev(svg, 'focusable', 'false');
				attr_dev(svg, 'aria-hidden', 'true');
				attr_dev(svg, 'style', (svg_style_value = `transform: rotate(${/*rotation*/ ctx[1]}deg)`));
				attr_dev(svg, 'class', 'svelte-1maum1v');
				add_location(svg, file$u, 16, 2, 520);
			},
			m: function mount(target, anchor) {
				insert_dev(target, svg, anchor);
				append_dev(svg, t);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(svg, null);
				}
			},
			p: function update(ctx, dirty) {
				if (dirty & /*paths*/ 4) {
					each_value = /*paths*/ ctx[2];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$4(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(svg, null);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				if (
					dirty & /*rotation*/ 2 &&
					svg_style_value !== (svg_style_value = `transform: rotate(${/*rotation*/ ctx[1]}deg)`)
				) {
					attr_dev(svg, 'style', svg_style_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(svg);
				destroy_each(each_blocks, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$b.name,
			type: 'if',
			source: '(16:0) {#if paths.length}',
			ctx,
		});

		return block;
	}

	// (25:4) {#each paths as path}
	function create_each_block$4(ctx) {
		let path;
		let path_d_value;

		const block = {
			c: function create() {
				path = svg_element('path');
				attr_dev(path, 'd', (path_d_value = /*path*/ ctx[4]));
				add_location(path, file$u, 25, 6, 718);
			},
			m: function mount(target, anchor) {
				insert_dev(target, path, anchor);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*paths*/ 4 && path_d_value !== (path_d_value = /*path*/ ctx[4])) {
					attr_dev(path, 'd', path_d_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(path);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block$4.name,
			type: 'each',
			source: '(25:4) {#each paths as path}',
			ctx,
		});

		return block;
	}

	function create_fragment$x(ctx) {
		let if_block_anchor;

		function select_block_type(ctx, dirty) {
			if (/*paths*/ ctx[2].length) return create_if_block$b;
			if (/*name*/ ctx[0] === 'discord') return create_if_block_1$4;
			if (/*name*/ ctx[0] === 'sun') return create_if_block_2$3;
			if (/*name*/ ctx[0] === 'moon') return create_if_block_3$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block = current_block_type && current_block_type(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
					if_block.p(ctx, dirty);
				} else {
					if (if_block) if_block.d(1);
					if_block = current_block_type && current_block_type(ctx);

					if (if_block) {
						if_block.c();
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (if_block) {
					if_block.d(detaching);
				}

				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$x.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	const iconOptions = Object.keys(pathsByName);
	const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];

	function instance$x($$self, $$props, $$invalidate) {
		let paths;
		let rotation;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Icon', slots, []);
		let { name = 'arrow' } = $$props;
		let { direction = 'n' } = $$props;
		const writable_props = ['name', 'direction'];

		Object_1$2.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Icon> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('name' in $$props) $$invalidate(0, (name = $$props.name));
			if ('direction' in $$props) $$invalidate(3, (direction = $$props.direction));
		};

		$$self.$capture_state = () => ({
			pathsByName,
			iconOptions,
			directions,
			name,
			direction,
			rotation,
			paths,
		});

		$$self.$inject_state = ($$props) => {
			if ('name' in $$props) $$invalidate(0, (name = $$props.name));
			if ('direction' in $$props) $$invalidate(3, (direction = $$props.direction));
			if ('rotation' in $$props) $$invalidate(1, (rotation = $$props.rotation));
			if ('paths' in $$props) $$invalidate(2, (paths = $$props.paths));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*name*/ 1) {
				$$invalidate(2, (paths = pathsByName[name] || []));
			}

			if ($$self.$$.dirty & /*direction*/ 8) {
				$$invalidate(1, (rotation = directions.indexOf(direction) * 45));
			}
		};

		return [name, rotation, paths, direction];
	}

	class Icon extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$x, create_fragment$x, safe_not_equal, { name: 0, direction: 3 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Icon',
				options,
				id: create_fragment$x.name,
			});
		}

		get name() {
			throw new Error(
				"<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set name(value) {
			throw new Error(
				"<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get direction() {
			throw new Error(
				"<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set direction(value) {
			throw new Error(
				"<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/DarkmodeToggle.svelte generated by Svelte v3.48.0 */
	const file$t = 'src/DarkmodeToggle.svelte';

	function create_fragment$w(ctx) {
		let div;
		let icon0;
		let t;
		let icon1;
		let current;
		icon0 = new Icon({ props: { name: 'sun' }, $$inline: true });
		icon1 = new Icon({ props: { name: 'moon' }, $$inline: true });

		const block = {
			c: function create() {
				div = element('div');
				create_component(icon0.$$.fragment);
				t = space();
				create_component(icon1.$$.fragment);
				attr_dev(div, 'role', 'switch');
				attr_dev(div, 'class', 'svelte-56n96w');
				add_location(div, file$t, 4, 0, 56);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(icon0, div, null);
				append_dev(div, t);
				mount_component(icon1, div, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon0.$$.fragment, local);
				transition_in(icon1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon0.$$.fragment, local);
				transition_out(icon1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(icon0);
				destroy_component(icon1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$w.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$w($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('DarkmodeToggle', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<DarkmodeToggle> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ Icon });
		return [];
	}

	class DarkmodeToggle extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$w, create_fragment$w, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'DarkmodeToggle',
				options,
				id: create_fragment$w.name,
			});
		}
	}

	/* src/Nav.svelte generated by Svelte v3.48.0 */
	const file$s = 'src/Nav.svelte';

	function create_fragment$v(ctx) {
		let nav;
		let ul0;
		let li0;
		let img;
		let img_src_value;
		let t0;
		let li1;
		let a0;
		let t2;
		let li2;
		let a1;
		let t4;
		let li3;
		let a2;
		let t6;
		let li4;
		let a3;
		let t8;
		let ul1;
		let li5;
		let darkmodetoggle;
		let t9;
		let li6;
		let wallet;
		let current;
		darkmodetoggle = new DarkmodeToggle({ $$inline: true });
		wallet = new Wallet({ $$inline: true });

		const block = {
			c: function create() {
				nav = element('nav');
				ul0 = element('ul');
				li0 = element('li');
				img = element('img');
				t0 = space();
				li1 = element('li');
				a0 = element('a');
				a0.textContent = 'Projects';
				t2 = space();
				li2 = element('li');
				a1 = element('a');
				a1.textContent = 'FAQ';
				t4 = space();
				li3 = element('li');
				a2 = element('a');
				a2.textContent = 'Discord';
				t6 = space();
				li4 = element('li');
				a3 = element('a');
				a3.textContent = 'Resources';
				t8 = space();
				ul1 = element('ul');
				li5 = element('li');
				create_component(darkmodetoggle.$$.fragment);
				t9 = space();
				li6 = element('li');
				create_component(wallet.$$.fragment);
				if (!src_url_equal(img.src, (img_src_value = './juice_logo-ol.png')))
					attr_dev(img, 'src', img_src_value);
				attr_dev(img, 'alt', 'Juicebox logo');
				attr_dev(img, 'class', 'svelte-jr8kzz');
				add_location(img, file$s, 7, 8, 141);
				attr_dev(li0, 'class', 'svelte-jr8kzz');
				add_location(li0, file$s, 7, 4, 137);
				attr_dev(a0, 'href', '/');
				attr_dev(a0, 'class', 'svelte-jr8kzz');
				add_location(a0, file$s, 8, 8, 208);
				attr_dev(li1, 'class', 'svelte-jr8kzz');
				add_location(li1, file$s, 8, 4, 204);
				attr_dev(a1, 'href', '/');
				attr_dev(a1, 'class', 'svelte-jr8kzz');
				add_location(a1, file$s, 9, 8, 246);
				attr_dev(li2, 'class', 'svelte-jr8kzz');
				add_location(li2, file$s, 9, 4, 242);
				attr_dev(a2, 'href', '/');
				attr_dev(a2, 'class', 'svelte-jr8kzz');
				add_location(a2, file$s, 10, 8, 279);
				attr_dev(li3, 'class', 'svelte-jr8kzz');
				add_location(li3, file$s, 10, 4, 275);
				attr_dev(a3, 'href', '/');
				attr_dev(a3, 'class', 'svelte-jr8kzz');
				add_location(a3, file$s, 11, 8, 316);
				attr_dev(li4, 'class', 'svelte-jr8kzz');
				add_location(li4, file$s, 11, 4, 312);
				attr_dev(ul0, 'class', 'svelte-jr8kzz');
				add_location(ul0, file$s, 6, 2, 128);
				attr_dev(li5, 'class', 'svelte-jr8kzz');
				add_location(li5, file$s, 15, 6, 370);
				attr_dev(li6, 'class', 'svelte-jr8kzz');
				add_location(li6, file$s, 16, 6, 404);
				attr_dev(ul1, 'class', 'svelte-jr8kzz');
				add_location(ul1, file$s, 14, 2, 359);
				attr_dev(nav, 'class', 'svelte-jr8kzz');
				add_location(nav, file$s, 5, 0, 120);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, nav, anchor);
				append_dev(nav, ul0);
				append_dev(ul0, li0);
				append_dev(li0, img);
				append_dev(ul0, t0);
				append_dev(ul0, li1);
				append_dev(li1, a0);
				append_dev(ul0, t2);
				append_dev(ul0, li2);
				append_dev(li2, a1);
				append_dev(ul0, t4);
				append_dev(ul0, li3);
				append_dev(li3, a2);
				append_dev(ul0, t6);
				append_dev(ul0, li4);
				append_dev(li4, a3);
				append_dev(nav, t8);
				append_dev(nav, ul1);
				append_dev(ul1, li5);
				mount_component(darkmodetoggle, li5, null);
				append_dev(ul1, t9);
				append_dev(ul1, li6);
				mount_component(wallet, li6, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(darkmodetoggle.$$.fragment, local);
				transition_in(wallet.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(darkmodetoggle.$$.fragment, local);
				transition_out(wallet.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(nav);
				destroy_component(darkmodetoggle);
				destroy_component(wallet);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$v.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$v($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Nav', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Nav> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ Wallet, DarkmodeToggle });
		return [];
	}

	class Nav extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$v, create_fragment$v, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Nav',
				options,
				id: create_fragment$v.name,
			});
		}
	}

	/* src/Button.svelte generated by Svelte v3.48.0 */

	const file$r = 'src/Button.svelte';

	function create_fragment$u(ctx) {
		let button;
		let button_class_value;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[3].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

		const block = {
			c: function create() {
				button = element('button');
				if (default_slot) default_slot.c();
				attr_dev(
					button,
					'class',
					(button_class_value = '' + (null_to_empty(/*size*/ ctx[1]) + ' svelte-16p2c0l')),
				);
				add_location(button, file$r, 4, 0, 73);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);

				if (default_slot) {
					default_slot.m(button, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(
						button,
						'click',
						function () {
							if (is_function(/*onClick*/ ctx[0])) /*onClick*/ ctx[0].apply(this, arguments);
						},
						false,
						false,
						false,
					);

					mounted = true;
				}
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;

				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[2],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
							null,
						);
					}
				}

				if (
					!current ||
					(dirty & /*size*/ 2 &&
						button_class_value !==
							(button_class_value = '' + (null_to_empty(/*size*/ ctx[1]) + ' svelte-16p2c0l')))
				) {
					attr_dev(button, 'class', button_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(button);
				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$u.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$u($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Button', slots, ['default']);
		let { onClick } = $$props;
		let { size = 'lg' } = $$props;
		const writable_props = ['onClick', 'size'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Button> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('onClick' in $$props) $$invalidate(0, (onClick = $$props.onClick));
			if ('size' in $$props) $$invalidate(1, (size = $$props.size));
			if ('$$scope' in $$props) $$invalidate(2, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ onClick, size });

		$$self.$inject_state = ($$props) => {
			if ('onClick' in $$props) $$invalidate(0, (onClick = $$props.onClick));
			if ('size' in $$props) $$invalidate(1, (size = $$props.size));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [onClick, size, $$scope, slots];
	}

	class Button extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$u, create_fragment$u, safe_not_equal, { onClick: 0, size: 1 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Button',
				options,
				id: create_fragment$u.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*onClick*/ ctx[0] === undefined && !('onClick' in props)) {
				console.warn("<Button> was created without expected prop 'onClick'");
			}
		}

		get onClick() {
			throw new Error(
				"<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set onClick(value) {
			throw new Error(
				"<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get size() {
			throw new Error(
				"<Button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set size(value) {
			throw new Error(
				"<Button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/LandingInfo.svelte generated by Svelte v3.48.0 */
	const file$q = 'src/LandingInfo.svelte';

	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (28:4) {#each list as item}
	function create_each_block$3(ctx) {
		let div;
		let img;
		let img_src_value;
		let t0;
		let p;
		let t1_value = /*item*/ ctx[1] + '';
		let t1;

		const block = {
			c: function create() {
				div = element('div');
				img = element('img');
				t0 = space();
				p = element('p');
				t1 = text(t1_value);
				if (!src_url_equal(img.src, (img_src_value = './bolt.png')))
					attr_dev(img, 'src', img_src_value);
				attr_dev(img, 'alt', '⚡️');
				attr_dev(img, 'class', 'svelte-1am2hf1');
				add_location(img, file$q, 29, 8, 779);
				attr_dev(p, 'class', 'svelte-1am2hf1');
				add_location(p, file$q, 30, 8, 821);
				attr_dev(div, 'class', 'item svelte-1am2hf1');
				add_location(div, file$q, 28, 6, 752);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, img);
				append_dev(div, t0);
				append_dev(div, p);
				append_dev(p, t1);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block$3.name,
			type: 'each',
			source: '(28:4) {#each list as item}',
			ctx,
		});

		return block;
	}

	// (35:6) <Button>
	function create_default_slot_1$5(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('Design your project');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_1$5.name,
			type: 'slot',
			source: '(35:6) <Button>',
			ctx,
		});

		return block;
	}

	// (34:4) <Link to="/create">
	function create_default_slot$8(ctx) {
		let button;
		let current;

		button = new Button({
			props: {
				$$slots: { default: [create_default_slot_1$5] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(button.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(button, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 16) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(button, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$8.name,
			type: 'slot',
			source: '(34:4) <Link to=\\"/create\\">',
			ctx,
		});

		return block;
	}

	function create_fragment$t(ctx) {
		let section;
		let article;
		let h1;
		let t1;
		let p0;
		let t3;
		let p1;
		let t4;
		let a;
		let t6;
		let br;
		let t7;
		let p2;
		let t9;
		let t10;
		let link;
		let t11;
		let img;
		let img_src_value;
		let current;
		let each_value = /*list*/ ctx[0];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
		}

		link = new Link$1({
			props: {
				to: '/create',
				$$slots: { default: [create_default_slot$8] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				section = element('section');
				article = element('article');
				h1 = element('h1');
				h1.textContent = 'Community funding for people and projects';
				t1 = space();
				p0 = element('p');
				p0.textContent =
					'Build a community around a project, fund it, and program its spending.\n      Light enough for a group of friends, powerful enough for a global network\n      of anons.';
				t3 = space();
				p1 = element('p');
				t4 = text('Powered by public smart contracts on ');
				a = element('a');
				a.textContent = 'Ethereum.';
				t6 = space();
				br = element('br');
				t7 = space();
				p2 = element('p');
				p2.textContent = 'Built for:';
				t9 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t10 = space();
				create_component(link.$$.fragment);
				t11 = space();
				img = element('img');
				attr_dev(h1, 'class', 'svelte-1am2hf1');
				add_location(h1, file$q, 14, 4, 287);
				attr_dev(p0, 'class', 'svelte-1am2hf1');
				add_location(p0, file$q, 15, 4, 342);
				attr_dev(a, 'href', 'https://ethereum.org/en/what-is-ethereum/');
				attr_dev(a, 'class', 'svelte-1am2hf1');
				add_location(a, file$q, 21, 43, 579);
				attr_dev(p1, 'class', 'svelte-1am2hf1');
				add_location(p1, file$q, 20, 4, 532);
				add_location(br, file$q, 25, 4, 673);
				attr_dev(p2, 'class', 'sub-header svelte-1am2hf1');
				add_location(p2, file$q, 26, 4, 684);
				attr_dev(article, 'class', 'svelte-1am2hf1');
				add_location(article, file$q, 13, 2, 273);
				attr_dev(img, 'id', 'banny');
				if (!src_url_equal(img.src, (img_src_value = './banny.png')))
					attr_dev(img, 'src', img_src_value);
				attr_dev(img, 'alt', 'Banny partying with code');
				attr_dev(img, 'class', 'svelte-1am2hf1');
				add_location(img, file$q, 37, 2, 954);
				attr_dev(section, 'class', 'svelte-1am2hf1');
				add_location(section, file$q, 12, 0, 261);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);
				append_dev(section, article);
				append_dev(article, h1);
				append_dev(article, t1);
				append_dev(article, p0);
				append_dev(article, t3);
				append_dev(article, p1);
				append_dev(p1, t4);
				append_dev(p1, a);
				append_dev(article, t6);
				append_dev(article, br);
				append_dev(article, t7);
				append_dev(article, p2);
				append_dev(article, t9);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(article, null);
				}

				append_dev(article, t10);
				mount_component(link, article, null);
				append_dev(section, t11);
				append_dev(section, img);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*list*/ 1) {
					each_value = /*list*/ ctx[0];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
						} else {
							each_blocks[i] = create_each_block$3(child_ctx);
							each_blocks[i].c();
							each_blocks[i].m(article, t10);
						}
					}

					for (; i < each_blocks.length; i += 1) {
						each_blocks[i].d(1);
					}

					each_blocks.length = each_value.length;
				}

				const link_changes = {};

				if (dirty & /*$$scope*/ 16) {
					link_changes.$$scope = { dirty, ctx };
				}

				link.$set(link_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(link.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(link.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(section);
				destroy_each(each_blocks, detaching);
				destroy_component(link);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$t.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$t($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('LandingInfo', slots, []);

		const list = [
			'Indie artists, devs, creators',
			'Ethereum protocols and DAOs',
			'Public goods and services',
			'Open source businesses',
		];

		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<LandingInfo> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ Link: Link$1, Button, list });
		return [list];
	}

	class LandingInfo extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$t, create_fragment$t, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'LandingInfo',
				options,
				id: create_fragment$t.name,
			});
		}
	}

	const projectDetails = writable({
		name: null,
		description: null,
		website: null,
		twitter: null,
		discord: null,
		payButtonText: 'Pay',
		payDisclosure: null,
		logo: null,
	});
	const visitedFundingDrawers = writable({
		funding: false,
		token: false,
		rules: false,
	});
	const isReviewPanel = writable(false);
	derived(
		projectDetails['twitter'],
		// TODO: Check if it starts with @, if not prefix it
		($twitter) => `@${$twitter}!`,
	);

	/* src/Tabs/Tabs.svelte generated by Svelte v3.48.0 */
	const file$p = 'src/Tabs/Tabs.svelte';

	function create_fragment$s(ctx) {
		let div;
		let current;
		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		const block = {
			c: function create() {
				div = element('div');
				if (default_slot) default_slot.c();
				attr_dev(div, 'class', 'tabs');
				add_location(div, file$p, 47, 0, 1063);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$s.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	const TABS = {};

	function instance$s($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Tabs', slots, ['default']);
		const tabs = [];
		const panels = [];
		const selectedTab = writable(null);
		const selectedPanel = writable(null);

		setContext(TABS, {
			registerTab: (tab) => {
				tabs.push(tab);
				selectedTab.update((current) => current || tab);

				onDestroy(() => {
					const i = tabs.indexOf(tab);
					tabs.splice(i, 1);

					selectedTab.update((current) =>
						current === tab ? tabs[i] || tabs[tabs.length - 1] : current,
					);
				});
			},
			registerPanel: (panel) => {
				panels.push(panel);
				selectedPanel.update((current) => current || panel);

				onDestroy(() => {
					const i = panels.indexOf(panel);
					panels.splice(i, 1);

					selectedPanel.update((current) =>
						current === panel ? panels[i] || panels[panels.length - 1] : current,
					);
				});
			},
			selectTab: (tab) => {
				const i = tabs.indexOf(tab);
				selectedTab.set(tab);
				selectedPanel.set(panels[i]);
			},
			selectedTab,
			selectedPanel,
		});

		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Tabs> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(0, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({
			TABS,
			setContext,
			onDestroy,
			writable,
			tabs,
			panels,
			selectedTab,
			selectedPanel,
		});

		return [$$scope, slots];
	}

	class Tabs extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$s, create_fragment$s, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Tabs',
				options,
				id: create_fragment$s.name,
			});
		}
	}

	/* src/Tabs/TabList.svelte generated by Svelte v3.48.0 */

	const file$o = 'src/Tabs/TabList.svelte';

	function create_fragment$r(ctx) {
		let div;
		let current;
		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		const block = {
			c: function create() {
				div = element('div');
				if (default_slot) default_slot.c();
				attr_dev(div, 'class', 'tab-list svelte-364i86');
				add_location(div, file$o, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$r.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$r($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TabList', slots, ['default']);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<TabList> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(0, ($$scope = $$props.$$scope));
		};

		return [$$scope, slots];
	}

	class TabList extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$r, create_fragment$r, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'TabList',
				options,
				id: create_fragment$r.name,
			});
		}
	}

	/* src/Tabs/TabPanel.svelte generated by Svelte v3.48.0 */

	// (11:0) {#if $selectedPanel === panel}
	function create_if_block$a(ctx) {
		let current;
		const default_slot_template = /*#slots*/ ctx[4].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

		const block = {
			c: function create() {
				if (default_slot) default_slot.c();
			},
			m: function mount(target, anchor) {
				if (default_slot) {
					default_slot.m(target, anchor);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 8)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[3],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$a.name,
			type: 'if',
			source: '(11:0) {#if $selectedPanel === panel}',
			ctx,
		});

		return block;
	}

	function create_fragment$q(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1] && create_if_block$a(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*$selectedPanel*/ ctx[0] === /*panel*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*$selectedPanel*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$a(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$q.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$q($$self, $$props, $$invalidate) {
		let $selectedPanel;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TabPanel', slots, ['default']);
		const panel = {};
		const { registerPanel, selectedPanel } = getContext(TABS);
		validate_store(selectedPanel, 'selectedPanel');
		component_subscribe($$self, selectedPanel, (value) =>
			$$invalidate(0, ($selectedPanel = value)),
		);
		registerPanel(panel);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<TabPanel> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(3, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({
			getContext,
			TABS,
			panel,
			registerPanel,
			selectedPanel,
			$selectedPanel,
		});

		return [$selectedPanel, panel, selectedPanel, $$scope, slots];
	}

	class TabPanel extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$q, create_fragment$q, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'TabPanel',
				options,
				id: create_fragment$q.name,
			});
		}
	}

	/* src/Tabs/Tab.svelte generated by Svelte v3.48.0 */
	const file$n = 'src/Tabs/Tab.svelte';

	function create_fragment$p(ctx) {
		let button;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[6].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

		const block = {
			c: function create() {
				button = element('button');
				if (default_slot) default_slot.c();
				attr_dev(button, 'id', /*id*/ ctx[0]);
				attr_dev(button, 'class', 'svelte-1fr4akq');
				toggle_class(button, 'selected', /*$selectedTab*/ ctx[1] === /*tab*/ ctx[2]);
				add_location(button, file$n, 23, 0, 530);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);

				if (default_slot) {
					default_slot.m(button, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(button, 'click', /*onClick*/ ctx[4], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 32)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[5],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[5])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null),
							null,
						);
					}
				}

				if (!current || dirty & /*id*/ 1) {
					attr_dev(button, 'id', /*id*/ ctx[0]);
				}

				if (dirty & /*$selectedTab, tab*/ 6) {
					toggle_class(button, 'selected', /*$selectedTab*/ ctx[1] === /*tab*/ ctx[2]);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(button);
				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$p.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$p($$self, $$props, $$invalidate) {
		let $selectedTab;
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Tab', slots, ['default']);
		let { id } = $$props;
		const tab = {};
		const { registerTab, selectTab, selectedTab } = getContext(TABS);
		validate_store(selectedTab, 'selectedTab');
		component_subscribe($$self, selectedTab, (value) => $$invalidate(1, ($selectedTab = value)));
		registerTab(tab);

		function onClick() {
			selectTab(tab);

			// NOTE: I'd rather not have this here as separation of concerns... but, it's a quick fix for now.
			if (id === 'review') {
				isReviewPanel.set(true);
			} else {
				isReviewPanel.set(false);
			}
		}

		const writable_props = ['id'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Tab> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('id' in $$props) $$invalidate(0, (id = $$props.id));
			if ('$$scope' in $$props) $$invalidate(5, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({
			getContext,
			TABS,
			isReviewPanel,
			id,
			tab,
			registerTab,
			selectTab,
			selectedTab,
			onClick,
			$selectedTab,
		});

		$$self.$inject_state = ($$props) => {
			if ('id' in $$props) $$invalidate(0, (id = $$props.id));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [id, $selectedTab, tab, selectedTab, onClick, $$scope, slots];
	}

	class Tab extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$p, create_fragment$p, safe_not_equal, { id: 0 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Tab',
				options,
				id: create_fragment$p.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*id*/ ctx[0] === undefined && !('id' in props)) {
				console.warn("<Tab> was created without expected prop 'id'");
			}
		}

		get id() {
			throw new Error(
				"<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set id(value) {
			throw new Error(
				"<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/InfoSpaceBetween.svelte generated by Svelte v3.48.0 */

	const file$m = 'src/InfoSpaceBetween.svelte';
	const get_right_slot_changes = (dirty) => ({});
	const get_right_slot_context = (ctx) => ({});
	const get_left_slot_changes = (dirty) => ({});
	const get_left_slot_context = (ctx) => ({});

	function create_fragment$o(ctx) {
		let section;
		let t;
		let current;
		const left_slot_template = /*#slots*/ ctx[1].left;
		const left_slot = create_slot(
			left_slot_template,
			ctx,
			/*$$scope*/ ctx[0],
			get_left_slot_context,
		);
		const right_slot_template = /*#slots*/ ctx[1].right;
		const right_slot = create_slot(
			right_slot_template,
			ctx,
			/*$$scope*/ ctx[0],
			get_right_slot_context,
		);

		const block = {
			c: function create() {
				section = element('section');
				if (left_slot) left_slot.c();
				t = space();
				if (right_slot) right_slot.c();
				attr_dev(section, 'class', 'svelte-1ddbej2');
				add_location(section, file$m, 3, 0, 140);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);

				if (left_slot) {
					left_slot.m(section, null);
				}

				append_dev(section, t);

				if (right_slot) {
					right_slot.m(section, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (left_slot) {
					if (left_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							left_slot,
							left_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
								: get_slot_changes(
										left_slot_template,
										/*$$scope*/ ctx[0],
										dirty,
										get_left_slot_changes,
								  ),
							get_left_slot_context,
						);
					}
				}

				if (right_slot) {
					if (right_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							right_slot,
							right_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
								: get_slot_changes(
										right_slot_template,
										/*$$scope*/ ctx[0],
										dirty,
										get_right_slot_changes,
								  ),
							get_right_slot_context,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(left_slot, local);
				transition_in(right_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(left_slot, local);
				transition_out(right_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(section);
				if (left_slot) left_slot.d(detaching);
				if (right_slot) right_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$o.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$o($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('InfoSpaceBetween', slots, ['left', 'right']);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<InfoSpaceBetween> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(0, ($$scope = $$props.$$scope));
		};

		return [$$scope, slots];
	}

	class InfoSpaceBetween extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$o, create_fragment$o, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'InfoSpaceBetween',
				options,
				id: create_fragment$o.name,
			});
		}
	}

	/* src/Popover.svelte generated by Svelte v3.48.0 */

	const file$l = 'src/Popover.svelte';

	function create_fragment$n(ctx) {
		let div1;
		let t0;
		let div0;
		let p;
		let t1;
		let current;
		const default_slot_template = /*#slots*/ ctx[2].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

		const block = {
			c: function create() {
				div1 = element('div');
				if (default_slot) default_slot.c();
				t0 = space();
				div0 = element('div');
				p = element('p');
				t1 = text(/*message*/ ctx[0]);
				attr_dev(p, 'class', 'message svelte-3dvazj');
				add_location(p, file$l, 6, 6, 116);
				attr_dev(div0, 'class', 'content svelte-3dvazj');
				add_location(div0, file$l, 5, 4, 88);
				attr_dev(div1, 'class', 'wrapper svelte-3dvazj');
				add_location(div1, file$l, 3, 0, 49);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);

				if (default_slot) {
					default_slot.m(div1, null);
				}

				append_dev(div1, t0);
				append_dev(div1, div0);
				append_dev(div0, p);
				append_dev(p, t1);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[1],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
							null,
						);
					}
				}

				if (!current || dirty & /*message*/ 1) set_data_dev(t1, /*message*/ ctx[0]);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div1);
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$n.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$n($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Popover', slots, ['default']);
		let { message } = $$props;
		const writable_props = ['message'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Popover> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('message' in $$props) $$invalidate(0, (message = $$props.message));
			if ('$$scope' in $$props) $$invalidate(1, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ message });

		$$self.$inject_state = ($$props) => {
			if ('message' in $$props) $$invalidate(0, (message = $$props.message));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [message, $$scope, slots];
	}

	class Popover extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$n, create_fragment$n, safe_not_equal, { message: 0 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Popover',
				options,
				id: create_fragment$n.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*message*/ ctx[0] === undefined && !('message' in props)) {
				console.warn("<Popover> was created without expected prop 'message'");
			}
		}

		get message() {
			throw new Error(
				"<Popover>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set message(value) {
			throw new Error(
				"<Popover>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/PopInfo.svelte generated by Svelte v3.48.0 */
	const file$k = 'src/PopInfo.svelte';

	// (8:2) <Popover {message}     >
	function create_default_slot$7(ctx) {
		let div;
		let icon;
		let current;

		icon = new Icon({
			props: { name: 'questionCircle' },
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				create_component(icon.$$.fragment);
				attr_dev(div, 'class', 'gap svelte-ia3yea');
				add_location(div, file$k, 8, 5, 166);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(icon, div, null);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$7.name,
			type: 'slot',
			source: '(8:2) <Popover {message}     >',
			ctx,
		});

		return block;
	}

	function create_fragment$m(ctx) {
		let div;
		let t;
		let popover;
		let current;
		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

		popover = new Popover({
			props: {
				message: /*message*/ ctx[0],
				$$slots: { default: [create_default_slot$7] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				if (default_slot) default_slot.c();
				t = space();
				create_component(popover.$$.fragment);
				attr_dev(div, 'class', 'svelte-ia3yea');
				add_location(div, file$k, 5, 0, 123);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				append_dev(div, t);
				mount_component(popover, div, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[2],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
							null,
						);
					}
				}

				const popover_changes = {};
				if (dirty & /*message*/ 1) popover_changes.message = /*message*/ ctx[0];

				if (dirty & /*$$scope*/ 4) {
					popover_changes.$$scope = { dirty, ctx };
				}

				popover.$set(popover_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				transition_in(popover.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				transition_out(popover.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
				destroy_component(popover);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$m.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$m($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('PopInfo', slots, ['default']);
		let { message } = $$props;
		const writable_props = ['message'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<PopInfo> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('message' in $$props) $$invalidate(0, (message = $$props.message));
			if ('$$scope' in $$props) $$invalidate(2, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ Icon, Popover, message });

		$$self.$inject_state = ($$props) => {
			if ('message' in $$props) $$invalidate(0, (message = $$props.message));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [message, slots, $$scope];
	}

	class PopInfo extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$m, create_fragment$m, safe_not_equal, { message: 0 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'PopInfo',
				options,
				id: create_fragment$m.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*message*/ ctx[0] === undefined && !('message' in props)) {
				console.warn("<PopInfo> was created without expected prop 'message'");
			}
		}

		get message() {
			throw new Error(
				"<PopInfo>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set message(value) {
			throw new Error(
				"<PopInfo>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/Preview/CashMoney.svelte generated by Svelte v3.48.0 */
	const file$j = 'src/Preview/CashMoney.svelte';

	// (11:4) <PopInfo message="The balance of this project in the Juicebox contract."       >
	function create_default_slot_3$3(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element('p');
				p.textContent = 'In juicebox';
				attr_dev(p, 'class', 'svelte-1uyon7l');
				add_location(p, file$j, 11, 7, 434);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_3$3.name,
			type: 'slot',
			source:
				'(11:4) <PopInfo message=\\"The balance of this project in the Juicebox contract.\\"       >',
			ctx,
		});

		return block;
	}

	// (10:2)
	function create_left_slot_2$1(ctx) {
		let div;
		let popinfo;
		let current;

		popinfo = new PopInfo({
			props: {
				message: 'The balance of this project in the Juicebox contract.',
				$$slots: { default: [create_default_slot_3$3] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				create_component(popinfo.$$.fragment);
				attr_dev(div, 'slot', 'left');
				attr_dev(div, 'class', 'svelte-1uyon7l');
				add_location(div, file$j, 9, 2, 332);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(popinfo, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 1) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(popinfo);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot_2$1.name,
			type: 'slot',
			source: '(10:2) ',
			ctx,
		});

		return block;
	}

	// (15:2)
	function create_right_slot_1$1(ctx) {
		let p;
		let eth;
		let t;
		let current;
		eth = new Ethereum({ $$inline: true });

		const block = {
			c: function create() {
				p = element('p');
				create_component(eth.$$.fragment);
				t = text('0');
				attr_dev(p, 'slot', 'right');
				attr_dev(p, 'class', 'money svelte-1uyon7l');
				add_location(p, file$j, 14, 2, 479);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				mount_component(eth, p, null);
				append_dev(p, t);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(eth.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eth.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
				destroy_component(eth);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_right_slot_1$1.name,
			type: 'slot',
			source: '(15:2) ',
			ctx,
		});

		return block;
	}

	// (19:4) <PopInfo       message="The amount that has been distributed from the Juicebox balance in this funding cycle, out of the current distribution limit. No more than the distribution limit can be distributed in a single funding cycle—any remaining ETH in Juicebox is overflow, until the next cycle begins."     >
	function create_default_slot_2$4(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element('p');
				p.textContent = 'Distributed';
				attr_dev(p, 'class', 'svelte-1uyon7l');
				add_location(p, file$j, 21, 6, 900);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_2$4.name,
			type: 'slot',
			source:
				'(19:4) <PopInfo       message=\\"The amount that has been distributed from the Juicebox balance in this funding cycle, out of the current distribution limit. No more than the distribution limit can be distributed in a single funding cycle—any remaining ETH in Juicebox is overflow, until the next cycle begins.\\"     >',
			ctx,
		});

		return block;
	}

	// (18:2)
	function create_left_slot_1$1(ctx) {
		let div;
		let popinfo;
		let current;

		popinfo = new PopInfo({
			props: {
				message:
					'The amount that has been distributed from the Juicebox balance in this funding cycle, out of the current distribution limit. No more than the distribution limit can be distributed in a single funding cycle—any remaining ETH in Juicebox is overflow, until the next cycle begins.',
				$$slots: { default: [create_default_slot_2$4] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				create_component(popinfo.$$.fragment);
				attr_dev(div, 'slot', 'left');
				attr_dev(div, 'class', 'svelte-1uyon7l');
				add_location(div, file$j, 17, 2, 563);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(popinfo, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 1) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(popinfo);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot_1$1.name,
			type: 'slot',
			source: '(18:2) ',
			ctx,
		});

		return block;
	}

	// (26:4) <PopInfo       message="The target for this funding cycle is 0, meaning all funds in Juicebox are currently considered overflow. Overflow can be redeemed by token holders, but not distributed."       >
	function create_default_slot_1$4(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element('p');
				p.textContent = '100% Overflow';
				attr_dev(p, 'class', 'svelte-1uyon7l');
				add_location(p, file$j, 27, 7, 1169);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_1$4.name,
			type: 'slot',
			source:
				'(26:4) <PopInfo       message=\\"The target for this funding cycle is 0, meaning all funds in Juicebox are currently considered overflow. Overflow can be redeemed by token holders, but not distributed.\\"       >',
			ctx,
		});

		return block;
	}

	// (25:2)
	function create_right_slot$1(ctx) {
		let div;
		let popinfo;
		let current;

		popinfo = new PopInfo({
			props: {
				message:
					'The target for this funding cycle is 0, meaning all funds in Juicebox are currently considered overflow. Overflow can be redeemed by token holders, but not distributed.',
				$$slots: { default: [create_default_slot_1$4] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				create_component(popinfo.$$.fragment);
				attr_dev(div, 'slot', 'right');
				attr_dev(div, 'class', 'svelte-1uyon7l');
				add_location(div, file$j, 24, 2, 945);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(popinfo, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 1) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(popinfo);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_right_slot$1.name,
			type: 'slot',
			source: '(25:2) ',
			ctx,
		});

		return block;
	}

	// (35:4) <PopInfo message="The balance of the project owner's wallet.">
	function create_default_slot$6(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element('p');
				p.textContent = 'In wallet';
				attr_dev(p, 'class', 'svelte-1uyon7l');
				add_location(p, file$j, 35, 6, 1378);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$6.name,
			type: 'slot',
			source: '(35:4) <PopInfo message=\\"The balance of the project owner\'s wallet.\\">',
			ctx,
		});

		return block;
	}

	// (34:2)
	function create_left_slot$1(ctx) {
		let div;
		let popinfo;
		let current;

		popinfo = new PopInfo({
			props: {
				message: "The balance of the project owner's wallet.",
				$$slots: { default: [create_default_slot$6] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				create_component(popinfo.$$.fragment);
				attr_dev(div, 'slot', 'left');
				attr_dev(div, 'class', 'svelte-1uyon7l');
				add_location(div, file$j, 33, 2, 1287);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(popinfo, div, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 1) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(popinfo);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot$1.name,
			type: 'slot',
			source: '(34:2) ',
			ctx,
		});

		return block;
	}

	function create_fragment$l(ctx) {
		let infospacebetween0;
		let t0;
		let infospacebetween1;
		let t1;
		let progress;
		let t2;
		let infospacebetween2;
		let current;

		infospacebetween0 = new InfoSpaceBetween({
			props: {
				$$slots: {
					right: [create_right_slot_1$1],
					left: [create_left_slot_2$1],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		infospacebetween1 = new InfoSpaceBetween({
			props: {
				$$slots: {
					right: [create_right_slot$1],
					left: [create_left_slot_1$1],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		infospacebetween2 = new InfoSpaceBetween({
			props: {
				$$slots: { left: [create_left_slot$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(infospacebetween0.$$.fragment);
				t0 = space();
				create_component(infospacebetween1.$$.fragment);
				t1 = space();
				progress = element('progress');
				t2 = space();
				create_component(infospacebetween2.$$.fragment);
				attr_dev(progress, 'max', '100');
				progress.value = '';
				attr_dev(progress, 'class', 'svelte-1uyon7l');
				add_location(progress, file$j, 31, 0, 1234);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				mount_component(infospacebetween0, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(infospacebetween1, target, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, progress, anchor);
				insert_dev(target, t2, anchor);
				mount_component(infospacebetween2, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const infospacebetween0_changes = {};

				if (dirty & /*$$scope*/ 1) {
					infospacebetween0_changes.$$scope = { dirty, ctx };
				}

				infospacebetween0.$set(infospacebetween0_changes);
				const infospacebetween1_changes = {};

				if (dirty & /*$$scope*/ 1) {
					infospacebetween1_changes.$$scope = { dirty, ctx };
				}

				infospacebetween1.$set(infospacebetween1_changes);
				const infospacebetween2_changes = {};

				if (dirty & /*$$scope*/ 1) {
					infospacebetween2_changes.$$scope = { dirty, ctx };
				}

				infospacebetween2.$set(infospacebetween2_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(infospacebetween0.$$.fragment, local);
				transition_in(infospacebetween1.$$.fragment, local);
				transition_in(infospacebetween2.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(infospacebetween0.$$.fragment, local);
				transition_out(infospacebetween1.$$.fragment, local);
				transition_out(infospacebetween2.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(infospacebetween0, detaching);
				if (detaching) detach_dev(t0);
				destroy_component(infospacebetween1, detaching);
				if (detaching) detach_dev(t1);
				if (detaching) detach_dev(progress);
				if (detaching) detach_dev(t2);
				destroy_component(infospacebetween2, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$l.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$l($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CashMoney', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<CashMoney> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ InfoSpaceBetween, PopInfo, ETH: Ethereum });
		return [];
	}

	class CashMoney extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'CashMoney',
				options,
				id: create_fragment$l.name,
			});
		}
	}

	function cubicOut(t) {
		const f = t - 1.0;
		return f * f * f + 1.0;
	}

	function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
		const o = +getComputedStyle(node).opacity;
		return {
			delay,
			duration,
			easing,
			css: (t) => `opacity: ${t * o}`,
		};
	}
	function fly(
		node,
		{ delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {},
	) {
		const style = getComputedStyle(node);
		const target_opacity = +style.opacity;
		const transform = style.transform === 'none' ? '' : style.transform;
		const od = target_opacity * (1 - opacity);
		return {
			delay,
			duration,
			easing,
			css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - od * u}`,
		};
	}
	function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
		const style = getComputedStyle(node);
		const opacity = +style.opacity;
		const height = parseFloat(style.height);
		const padding_top = parseFloat(style.paddingTop);
		const padding_bottom = parseFloat(style.paddingBottom);
		const margin_top = parseFloat(style.marginTop);
		const margin_bottom = parseFloat(style.marginBottom);
		const border_top_width = parseFloat(style.borderTopWidth);
		const border_bottom_width = parseFloat(style.borderBottomWidth);
		return {
			delay,
			duration,
			easing,
			css: (t) =>
				'overflow: hidden;' +
				`opacity: ${Math.min(t * 20, 1) * opacity};` +
				`height: ${t * height}px;` +
				`padding-top: ${t * padding_top}px;` +
				`padding-bottom: ${t * padding_bottom}px;` +
				`margin-top: ${t * margin_top}px;` +
				`margin-bottom: ${t * margin_bottom}px;` +
				`border-top-width: ${t * border_top_width}px;` +
				`border-bottom-width: ${t * border_bottom_width}px;`,
		};
	}

	/* src/CollapsibleSection.svelte generated by Svelte v3.48.0 */
	const file$i = 'src/CollapsibleSection.svelte';
	const get_header_slot_changes = (dirty) => ({});
	const get_header_slot_context = (ctx) => ({});

	// (13:0) {#if expanded}
	function create_if_block$9(ctx) {
		let div;
		let div_transition;
		let current;
		const default_slot_template = /*#slots*/ ctx[2].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

		const block = {
			c: function create() {
				div = element('div');
				if (default_slot) default_slot.c();
				add_location(div, file$i, 13, 2, 309);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[1],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);

				add_render_callback(() => {
					if (!div_transition)
						div_transition = create_bidirectional_transition(div, slide, {}, true);
					div_transition.run(1);
				});

				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				if (!div_transition)
					div_transition = create_bidirectional_transition(div, slide, {}, false);
				div_transition.run(0);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
				if (detaching && div_transition) div_transition.end();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$9.name,
			type: 'if',
			source: '(13:0) {#if expanded}',
			ctx,
		});

		return block;
	}

	function create_fragment$k(ctx) {
		let button;
		let icon;
		let t0;
		let t1;
		let if_block_anchor;
		let current;
		let mounted;
		let dispose;

		icon = new Icon({
			props: {
				name: 'caret',
				direction: /*expanded*/ ctx[0] ? 'e' : 'n',
			},
			$$inline: true,
		});

		const header_slot_template = /*#slots*/ ctx[2].header;
		const header_slot = create_slot(
			header_slot_template,
			ctx,
			/*$$scope*/ ctx[1],
			get_header_slot_context,
		);
		let if_block = /*expanded*/ ctx[0] && create_if_block$9(ctx);

		const block = {
			c: function create() {
				button = element('button');
				create_component(icon.$$.fragment);
				t0 = space();
				if (header_slot) header_slot.c();
				t1 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr_dev(button, 'aria-expanded', /*expanded*/ ctx[0]);
				attr_dev(button, 'class', 'svelte-11ojtf5');
				add_location(button, file$i, 7, 0, 125);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, button, anchor);
				mount_component(icon, button, null);
				append_dev(button, t0);

				if (header_slot) {
					header_slot.m(button, null);
				}

				insert_dev(target, t1, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;

				if (!mounted) {
					dispose = listen_dev(button, 'click', /*click_handler*/ ctx[3], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				const icon_changes = {};
				if (dirty & /*expanded*/ 1) icon_changes.direction = /*expanded*/ ctx[0] ? 'e' : 'n';
				icon.$set(icon_changes);

				if (header_slot) {
					if (header_slot.p && (!current || dirty & /*$$scope*/ 2)) {
						update_slot_base(
							header_slot,
							header_slot_template,
							ctx,
							/*$$scope*/ ctx[1],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
								: get_slot_changes(
										header_slot_template,
										/*$$scope*/ ctx[1],
										dirty,
										get_header_slot_changes,
								  ),
							get_header_slot_context,
						);
					}
				}

				if (!current || dirty & /*expanded*/ 1) {
					attr_dev(button, 'aria-expanded', /*expanded*/ ctx[0]);
				}

				if (/*expanded*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*expanded*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$9(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				transition_in(header_slot, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				transition_out(header_slot, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(button);
				destroy_component(icon);
				if (header_slot) header_slot.d(detaching);
				if (detaching) detach_dev(t1);
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$k.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$k($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CollapsibleSection', slots, ['header', 'default']);
		let expanded = true;
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<CollapsibleSection> was created with unknown prop '${key}'`);
		});

		const click_handler = () => $$invalidate(0, (expanded = !expanded));

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(1, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ slide, Icon, expanded });

		$$self.$inject_state = ($$props) => {
			if ('expanded' in $$props) $$invalidate(0, (expanded = $$props.expanded));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [expanded, $$scope, slots, click_handler];
	}

	class CollapsibleSection extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'CollapsibleSection',
				options,
				id: create_fragment$k.name,
			});
		}
	}

	/* src/HeavyBorderBox.svelte generated by Svelte v3.48.0 */

	const file$h = 'src/HeavyBorderBox.svelte';

	function create_fragment$j(ctx) {
		let section;
		let current;
		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		const block = {
			c: function create() {
				section = element('section');
				if (default_slot) default_slot.c();
				attr_dev(section, 'class', 'svelte-1c2wzia');
				add_location(section, file$h, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, section, anchor);

				if (default_slot) {
					default_slot.m(section, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(section);
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$j.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$j($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('HeavyBorderBox', slots, ['default']);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<HeavyBorderBox> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(0, ($$scope = $$props.$$scope));
		};

		return [$$scope, slots];
	}

	class HeavyBorderBox extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$j, create_fragment$j, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'HeavyBorderBox',
				options,
				id: create_fragment$j.name,
			});
		}
	}

	/* src/Preview/Funding.svelte generated by Svelte v3.48.0 */
	const file$g = 'src/Preview/Funding.svelte';

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i].label;
		child_ctx[2] = list[i].value;
		child_ctx[3] = list[i].info;
		return child_ctx;
	}

	// (49:2) <PopInfo     message="Tokens are distributed to anyone who pays this project. If the project has set a funding target, tokens can be redeemed for a portion of the project's overflow whether or not they have been claimed yet."   >
	function create_default_slot_10(ctx) {
		let h4;

		const block = {
			c: function create() {
				h4 = element('h4');
				h4.textContent = 'Tokens';
				attr_dev(h4, 'class', 'svelte-tws5if');
				add_location(h4, file$g, 51, 4, 2557);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h4, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(h4);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_10.name,
			type: 'slot',
			source:
				'(49:2) <PopInfo     message=\\"Tokens are distributed to anyone who pays this project. If the project has set a funding target, tokens can be redeemed for a portion of the project\'s overflow whether or not they have been claimed yet.\\"   >',
			ctx,
		});

		return block;
	}

	// (58:2) <PopInfo     message="A project's lifetime is defined in funding cycles. If a funding target is set, the project can withdraw no more than the target for the duration of the cycle."     >
	function create_default_slot_9$1(ctx) {
		let h4;

		const block = {
			c: function create() {
				h4 = element('h4');
				h4.textContent = 'Funding cycle';
				attr_dev(h4, 'class', 'svelte-tws5if');
				add_location(h4, file$g, 59, 5, 2853);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h4, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(h4);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_9$1.name,
			type: 'slot',
			source:
				'(58:2) <PopInfo     message=\\"A project\'s lifetime is defined in funding cycles. If a funding target is set, the project can withdraw no more than the target for the duration of the cycle.\\"     >',
			ctx,
		});

		return block;
	}

	// (78:8) {:else}
	function create_else_block$2(ctx) {
		let p;
		let b;
		let t0_value = /*label*/ ctx[1] + '';
		let t0;
		let t1;
		let t2;
		let span;
		let t3_value = /*value*/ ctx[2] + '';
		let t3;

		const block = {
			c: function create() {
				p = element('p');
				b = element('b');
				t0 = text(t0_value);
				t1 = text(':');
				t2 = space();
				span = element('span');
				t3 = text(t3_value);
				add_location(b, file$g, 78, 25, 3401);
				attr_dev(span, 'class', 'svelte-tws5if');
				add_location(span, file$g, 78, 41, 3417);
				attr_dev(p, 'class', 'gap svelte-tws5if');
				add_location(p, file$g, 78, 10, 3386);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, b);
				append_dev(b, t0);
				append_dev(b, t1);
				append_dev(p, t2);
				append_dev(p, span);
				append_dev(span, t3);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block$2.name,
			type: 'else',
			source: '(78:8) {:else}',
			ctx,
		});

		return block;
	}

	// (72:8) {#if info}
	function create_if_block$8(ctx) {
		let div;
		let popinfo;
		let t0;
		let span;
		let t1_value = /*value*/ ctx[2] + '';
		let t1;
		let t2;
		let current;

		popinfo = new PopInfo({
			props: {
				message: /*info*/ ctx[3],
				$$slots: { default: [create_default_slot_8$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				create_component(popinfo.$$.fragment);
				t0 = text(':');
				span = element('span');
				t1 = text(t1_value);
				t2 = space();
				attr_dev(span, 'class', 'svelte-tws5if');
				add_location(span, file$g, 73, 68, 3294);
				attr_dev(div, 'class', 'title gap svelte-tws5if');
				add_location(div, file$g, 72, 10, 3202);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				mount_component(popinfo, div, null);
				append_dev(div, t0);
				append_dev(div, span);
				append_dev(span, t1);
				append_dev(div, t2);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(popinfo);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$8.name,
			type: 'if',
			source: '(72:8) {#if info}',
			ctx,
		});

		return block;
	}

	// (74:12) <PopInfo message={info}>
	function create_default_slot_8$1(ctx) {
		let p;
		let b;
		let t_value = /*label*/ ctx[1] + '';
		let t;

		const block = {
			c: function create() {
				p = element('p');
				b = element('b');
				t = text(t_value);
				add_location(b, file$g, 73, 39, 3265);
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 73, 36, 3262);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, b);
				append_dev(b, t);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_8$1.name,
			type: 'slot',
			source: '(74:12) <PopInfo message={info}>',
			ctx,
		});

		return block;
	}

	// (71:6) {#each cycleKeyValues as { label, value, info }}
	function create_each_block$2(ctx) {
		let current_block_type_index;
		let if_block;
		let if_block_anchor;
		let current;
		const if_block_creators = [create_if_block$8, create_else_block$2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*info*/ ctx[3]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] =
			if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				if_block.c();
				if_block_anchor = empty();
			},
			m: function mount(target, anchor) {
				if_blocks[current_block_type_index].m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				if_block.p(ctx, dirty);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if_blocks[current_block_type_index].d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block$2.name,
			type: 'each',
			source: '(71:6) {#each cycleKeyValues as { label, value, info }}',
			ctx,
		});

		return block;
	}

	// (65:2) <CollapsibleSection>
	function create_default_slot_7$1(ctx) {
		let div;
		let current;
		let each_value = /*cycleKeyValues*/ ctx[0];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});

		const block = {
			c: function create() {
				div = element('div');

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr_dev(div, 'class', 'current-cycle svelte-tws5if');
				add_location(div, file$g, 69, 4, 3090);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				if (dirty & /*cycleKeyValues*/ 1) {
					each_value = /*cycleKeyValues*/ ctx[0];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o: function outro(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_each(each_blocks, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_7$1.name,
			type: 'slot',
			source: '(65:2) <CollapsibleSection>',
			ctx,
		});

		return block;
	}

	// (66:4)
	function create_header_slot(ctx) {
		let div;
		let h4;
		let t1;
		let p;

		const block = {
			c: function create() {
				div = element('div');
				h4 = element('h4');
				h4.textContent = 'Cycle #1';
				t1 = space();
				p = element('p');
				p.textContent = '13d 23h 3m until #2';
				attr_dev(h4, 'class', 'collapse-header svelte-tws5if');
				add_location(h4, file$g, 66, 6, 3000);
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 67, 6, 3048);
				attr_dev(div, 'slot', 'header');
				attr_dev(div, 'class', 'svelte-tws5if');
				add_location(div, file$g, 65, 4, 2974);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, h4);
				append_dev(div, t1);
				append_dev(div, p);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_header_slot.name,
			type: 'slot',
			source: '(66:4) ',
			ctx,
		});

		return block;
	}

	// (64:0) <HeavyBorderBox>
	function create_default_slot_6$1(ctx) {
		let collapsiblesection;
		let current;

		collapsiblesection = new CollapsibleSection({
			props: {
				$$slots: {
					header: [create_header_slot],
					default: [create_default_slot_7$1],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(collapsiblesection.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(collapsiblesection, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const collapsiblesection_changes = {};

				if (dirty & /*$$scope*/ 64) {
					collapsiblesection_changes.$$scope = { dirty, ctx };
				}

				collapsiblesection.$set(collapsiblesection_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(collapsiblesection.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(collapsiblesection.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(collapsiblesection, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_6$1.name,
			type: 'slot',
			source: '(64:0) <HeavyBorderBox>',
			ctx,
		});

		return block;
	}

	// (90:8) <PopInfo           message="The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won't roll over to the next funding cycle, so funds should be distributed before this funding cycle ends."           >
	function create_default_slot_5$2(ctx) {
		let small;

		const block = {
			c: function create() {
				small = element('small');
				small.textContent = 'available';
				attr_dev(small, 'class', 'upper svelte-tws5if');
				add_location(small, file$g, 91, 11, 3903);
			},
			m: function mount(target, anchor) {
				insert_dev(target, small, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(small);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_5$2.name,
			type: 'slot',
			source:
				'(90:8) <PopInfo           message=\\"The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won\'t roll over to the next funding cycle, so funds should be distributed before this funding cycle ends.\\"           >',
			ctx,
		});

		return block;
	}

	// (87:4)
	function create_left_slot_3(ctx) {
		let div1;
		let div0;
		let p0;
		let eth0;
		let t0;
		let t1;
		let popinfo;
		let t2;
		let p1;
		let small0;
		let eth1;
		let t3;
		let t4;
		let p2;
		let small1;
		let eth2;
		let t5;
		let icon;
		let t6;
		let current;
		eth0 = new Ethereum({ $$inline: true });

		popinfo = new PopInfo({
			props: {
				message:
					"The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won't roll over to the next funding cycle, so funds should be distributed before this funding cycle ends.",
				$$slots: { default: [create_default_slot_5$2] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		eth1 = new Ethereum({ $$inline: true });
		eth2 = new Ethereum({ $$inline: true });
		icon = new Icon({ props: { name: 'crown' }, $$inline: true });

		const block = {
			c: function create() {
				div1 = element('div');
				div0 = element('div');
				p0 = element('p');
				create_component(eth0.$$.fragment);
				t0 = text('0');
				t1 = space();
				create_component(popinfo.$$.fragment);
				t2 = space();
				p1 = element('p');
				small0 = element('small');
				create_component(eth1.$$.fragment);
				t3 = text('0 distributed');
				t4 = space();
				p2 = element('p');
				small1 = element('small');
				create_component(eth2.$$.fragment);
				t5 = text('0 ');
				create_component(icon.$$.fragment);
				t6 = text(' owner balance');
				attr_dev(p0, 'class', 'svelte-tws5if');
				add_location(p0, file$g, 88, 8, 3621);
				attr_dev(div0, 'class', 'available svelte-tws5if');
				add_location(div0, file$g, 87, 6, 3589);
				add_location(small0, file$g, 94, 9, 3983);
				attr_dev(p1, 'class', 'svelte-tws5if');
				add_location(p1, file$g, 94, 6, 3980);
				add_location(small1, file$g, 95, 9, 4032);
				attr_dev(p2, 'class', 'svelte-tws5if');
				add_location(p2, file$g, 95, 6, 4029);
				attr_dev(div1, 'slot', 'left');
				attr_dev(div1, 'class', 'svelte-tws5if');
				add_location(div1, file$g, 86, 4, 3565);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, p0);
				mount_component(eth0, p0, null);
				append_dev(p0, t0);
				append_dev(div0, t1);
				mount_component(popinfo, div0, null);
				append_dev(div1, t2);
				append_dev(div1, p1);
				append_dev(p1, small0);
				mount_component(eth1, small0, null);
				append_dev(small0, t3);
				append_dev(div1, t4);
				append_dev(div1, p2);
				append_dev(p2, small1);
				mount_component(eth2, small1, null);
				append_dev(small1, t5);
				mount_component(icon, small1, null);
				append_dev(small1, t6);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eth0.$$.fragment, local);
				transition_in(popinfo.$$.fragment, local);
				transition_in(eth1.$$.fragment, local);
				transition_in(eth2.$$.fragment, local);
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eth0.$$.fragment, local);
				transition_out(popinfo.$$.fragment, local);
				transition_out(eth1.$$.fragment, local);
				transition_out(eth2.$$.fragment, local);
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div1);
				destroy_component(eth0);
				destroy_component(popinfo);
				destroy_component(eth1);
				destroy_component(eth2);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot_3.name,
			type: 'slot',
			source: '(87:4) ',
			ctx,
		});

		return block;
	}

	// (98:4)
	function create_right_slot_3(ctx) {
		let div;
		let button;

		const block = {
			c: function create() {
				div = element('div');
				button = element('button');
				button.textContent = 'Distribute funds';
				button.disabled = true;
				attr_dev(button, 'class', 'svelte-tws5if');
				add_location(button, file$g, 97, 22, 4129);
				attr_dev(div, 'slot', 'right');
				add_location(div, file$g, 97, 4, 4111);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, button);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_right_slot_3.name,
			type: 'slot',
			source: '(98:4) ',
			ctx,
		});

		return block;
	}

	// (101:4) <PopInfo       message="Available funds are distributed according to the payouts below."       >
	function create_default_slot_4$2(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('Distribution splits');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_4$2.name,
			type: 'slot',
			source:
				'(101:4) <PopInfo       message=\\"Available funds are distributed according to the payouts below.\\"       >',
			ctx,
		});

		return block;
	}

	// (107:4)
	function create_left_slot_2(ctx) {
		let p;
		let t0;
		let icon;
		let t1;
		let current;
		icon = new Icon({ props: { name: 'crown' }, $$inline: true });

		const block = {
			c: function create() {
				p = element('p');
				t0 = text('Project owner (you) ');
				create_component(icon.$$.fragment);
				t1 = text(':');
				attr_dev(p, 'slot', 'left');
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 106, 4, 4382);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, t0);
				mount_component(icon, p, null);
				append_dev(p, t1);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot_2.name,
			type: 'slot',
			source: '(107:4) ',
			ctx,
		});

		return block;
	}

	// (108:4)
	function create_right_slot_2(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element('p');
				p.textContent = '100%';
				attr_dev(p, 'slot', 'right');
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 107, 4, 4448);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_right_slot_2.name,
			type: 'slot',
			source: '(108:4) ',
			ctx,
		});

		return block;
	}

	// (85:0) <HeavyBorderBox>
	function create_default_slot_3$2(ctx) {
		let infospacebetween0;
		let t0;
		let h4;
		let popinfo;
		let t1;
		let infospacebetween1;
		let current;

		infospacebetween0 = new InfoSpaceBetween({
			props: {
				$$slots: {
					right: [create_right_slot_3],
					left: [create_left_slot_3],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		popinfo = new PopInfo({
			props: {
				message: 'Available funds are distributed according to the payouts below.',
				$$slots: { default: [create_default_slot_4$2] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		infospacebetween1 = new InfoSpaceBetween({
			props: {
				$$slots: {
					right: [create_right_slot_2],
					left: [create_left_slot_2],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(infospacebetween0.$$.fragment);
				t0 = space();
				h4 = element('h4');
				create_component(popinfo.$$.fragment);
				t1 = space();
				create_component(infospacebetween1.$$.fragment);
				attr_dev(h4, 'class', 'svelte-tws5if');
				add_location(h4, file$g, 99, 2, 4209);
			},
			m: function mount(target, anchor) {
				mount_component(infospacebetween0, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, h4, anchor);
				mount_component(popinfo, h4, null);
				insert_dev(target, t1, anchor);
				mount_component(infospacebetween1, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const infospacebetween0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					infospacebetween0_changes.$$scope = { dirty, ctx };
				}

				infospacebetween0.$set(infospacebetween0_changes);
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
				const infospacebetween1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					infospacebetween1_changes.$$scope = { dirty, ctx };
				}

				infospacebetween1.$set(infospacebetween1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(infospacebetween0.$$.fragment, local);
				transition_in(popinfo.$$.fragment, local);
				transition_in(infospacebetween1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(infospacebetween0.$$.fragment, local);
				transition_out(popinfo.$$.fragment, local);
				transition_out(infospacebetween1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(infospacebetween0, detaching);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(h4);
				destroy_component(popinfo);
				if (detaching) detach_dev(t1);
				destroy_component(infospacebetween1, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_3$2.name,
			type: 'slot',
			source: '(85:0) <HeavyBorderBox>',
			ctx,
		});

		return block;
	}

	// (116:8) <PopInfo           message="The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won't roll over to the next funding cycle, so funds should be distributed before this funding cycle ends."           >
	function create_default_slot_2$3(ctx) {
		let small;

		const block = {
			c: function create() {
				small = element('small');
				small.textContent = 'Tokens reserved';
				attr_dev(small, 'class', 'upper svelte-tws5if');
				add_location(small, file$g, 117, 11, 4886);
			},
			m: function mount(target, anchor) {
				insert_dev(target, small, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(small);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_2$3.name,
			type: 'slot',
			source:
				'(116:8) <PopInfo           message=\\"The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won\'t roll over to the next funding cycle, so funds should be distributed before this funding cycle ends.\\"           >',
			ctx,
		});

		return block;
	}

	// (113:4)
	function create_left_slot_1(ctx) {
		let div1;
		let div0;
		let p;
		let t1;
		let popinfo;
		let current;

		popinfo = new PopInfo({
			props: {
				message:
					"The funds available to distribution for this funding cycle (before the 2.5% JBX fee is subtracted). This number won't roll over to the next funding cycle, so funds should be distributed before this funding cycle ends.",
				$$slots: { default: [create_default_slot_2$3] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div1 = element('div');
				div0 = element('div');
				p = element('p');
				p.textContent = '0';
				t1 = space();
				create_component(popinfo.$$.fragment);
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 114, 8, 4611);
				attr_dev(div0, 'class', 'available svelte-tws5if');
				add_location(div0, file$g, 113, 6, 4579);
				attr_dev(div1, 'slot', 'left');
				attr_dev(div1, 'class', 'svelte-tws5if');
				add_location(div1, file$g, 112, 4, 4555);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div1, anchor);
				append_dev(div1, div0);
				append_dev(div0, p);
				append_dev(div0, t1);
				mount_component(popinfo, div0, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div1);
				destroy_component(popinfo);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot_1.name,
			type: 'slot',
			source: '(113:4) ',
			ctx,
		});

		return block;
	}

	// (122:4)
	function create_right_slot_1(ctx) {
		let div;
		let button;

		const block = {
			c: function create() {
				div = element('div');
				button = element('button');
				button.textContent = 'Distribute tokens';
				button.disabled = true;
				attr_dev(button, 'class', 'svelte-tws5if');
				add_location(button, file$g, 121, 22, 4996);
				attr_dev(div, 'slot', 'right');
				add_location(div, file$g, 121, 4, 4978);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, button);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_right_slot_1.name,
			type: 'slot',
			source: '(122:4) ',
			ctx,
		});

		return block;
	}

	// (125:4) <PopInfo       message="Available funds are distributed according to the payouts below."       >
	function create_default_slot_1$3(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('Reserved tokens (0%)');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_1$3.name,
			type: 'slot',
			source:
				'(125:4) <PopInfo       message=\\"Available funds are distributed according to the payouts below.\\"       >',
			ctx,
		});

		return block;
	}

	// (131:4)
	function create_left_slot(ctx) {
		let p;
		let t0;
		let icon;
		let t1;
		let current;
		icon = new Icon({ props: { name: 'crown' }, $$inline: true });

		const block = {
			c: function create() {
				p = element('p');
				t0 = text('Project owner (you) ');
				create_component(icon.$$.fragment);
				t1 = text(':');
				attr_dev(p, 'slot', 'left');
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 130, 4, 5251);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, t0);
				mount_component(icon, p, null);
				append_dev(p, t1);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_left_slot.name,
			type: 'slot',
			source: '(131:4) ',
			ctx,
		});

		return block;
	}

	// (132:4)
	function create_right_slot(ctx) {
		let p;

		const block = {
			c: function create() {
				p = element('p');
				p.textContent = '100%';
				attr_dev(p, 'slot', 'right');
				attr_dev(p, 'class', 'svelte-tws5if');
				add_location(p, file$g, 131, 4, 5317);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_right_slot.name,
			type: 'slot',
			source: '(132:4) ',
			ctx,
		});

		return block;
	}

	// (111:0) <HeavyBorderBox>
	function create_default_slot$5(ctx) {
		let infospacebetween0;
		let t0;
		let h4;
		let popinfo;
		let t1;
		let infospacebetween1;
		let current;

		infospacebetween0 = new InfoSpaceBetween({
			props: {
				$$slots: {
					right: [create_right_slot_1],
					left: [create_left_slot_1],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		popinfo = new PopInfo({
			props: {
				message: 'Available funds are distributed according to the payouts below.',
				$$slots: { default: [create_default_slot_1$3] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		infospacebetween1 = new InfoSpaceBetween({
			props: {
				$$slots: {
					right: [create_right_slot],
					left: [create_left_slot],
				},
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(infospacebetween0.$$.fragment);
				t0 = space();
				h4 = element('h4');
				create_component(popinfo.$$.fragment);
				t1 = space();
				create_component(infospacebetween1.$$.fragment);
				attr_dev(h4, 'class', 'svelte-tws5if');
				add_location(h4, file$g, 123, 2, 5077);
			},
			m: function mount(target, anchor) {
				mount_component(infospacebetween0, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, h4, anchor);
				mount_component(popinfo, h4, null);
				insert_dev(target, t1, anchor);
				mount_component(infospacebetween1, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const infospacebetween0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					infospacebetween0_changes.$$scope = { dirty, ctx };
				}

				infospacebetween0.$set(infospacebetween0_changes);
				const popinfo_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo_changes.$$scope = { dirty, ctx };
				}

				popinfo.$set(popinfo_changes);
				const infospacebetween1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					infospacebetween1_changes.$$scope = { dirty, ctx };
				}

				infospacebetween1.$set(infospacebetween1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(infospacebetween0.$$.fragment, local);
				transition_in(popinfo.$$.fragment, local);
				transition_in(infospacebetween1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(infospacebetween0.$$.fragment, local);
				transition_out(popinfo.$$.fragment, local);
				transition_out(infospacebetween1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(infospacebetween0, detaching);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(h4);
				destroy_component(popinfo);
				if (detaching) detach_dev(t1);
				destroy_component(infospacebetween1, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$5.name,
			type: 'slot',
			source: '(111:0) <HeavyBorderBox>',
			ctx,
		});

		return block;
	}

	function create_fragment$i(ctx) {
		let div0;
		let popinfo0;
		let t0;
		let p0;
		let t1;
		let span;
		let t3;
		let div1;
		let popinfo1;
		let t4;
		let p1;
		let t6;
		let heavyborderbox0;
		let t7;
		let heavyborderbox1;
		let t8;
		let heavyborderbox2;
		let current;

		popinfo0 = new PopInfo({
			props: {
				message:
					"Tokens are distributed to anyone who pays this project. If the project has set a funding target, tokens can be redeemed for a portion of the project's overflow whether or not they have been claimed yet.",
				$$slots: { default: [create_default_slot_10] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		popinfo1 = new PopInfo({
			props: {
				message:
					"A project's lifetime is defined in funding cycles. If a funding target is set, the project can withdraw no more than the target for the duration of the cycle.",
				$$slots: { default: [create_default_slot_9$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		heavyborderbox0 = new HeavyBorderBox({
			props: {
				$$slots: { default: [create_default_slot_6$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		heavyborderbox1 = new HeavyBorderBox({
			props: {
				$$slots: { default: [create_default_slot_3$2] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		heavyborderbox2 = new HeavyBorderBox({
			props: {
				$$slots: { default: [create_default_slot$5] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div0 = element('div');
				create_component(popinfo0.$$.fragment);
				t0 = space();
				p0 = element('p');
				t1 = text('Total supply: ');
				span = element('span');
				span.textContent = '0 tokens';
				t3 = space();
				div1 = element('div');
				create_component(popinfo1.$$.fragment);
				t4 = space();
				p1 = element('p');
				p1.textContent = 'CURRENT';
				t6 = space();
				create_component(heavyborderbox0.$$.fragment);
				t7 = space();
				create_component(heavyborderbox1.$$.fragment);
				t8 = space();
				create_component(heavyborderbox2.$$.fragment);
				attr_dev(div0, 'class', 'title yellow svelte-tws5if');
				add_location(div0, file$g, 47, 0, 2294);
				attr_dev(span, 'class', 'svelte-tws5if');
				add_location(span, file$g, 54, 17, 2610);
				attr_dev(p0, 'class', 'svelte-tws5if');
				add_location(p0, file$g, 54, 0, 2593);
				attr_dev(div1, 'class', 'title yellow svelte-tws5if');
				add_location(div1, file$g, 56, 0, 2637);
				attr_dev(p1, 'class', 'sub-header svelte-tws5if');
				add_location(p1, file$g, 62, 0, 2896);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				mount_component(popinfo0, div0, null);
				insert_dev(target, t0, anchor);
				insert_dev(target, p0, anchor);
				append_dev(p0, t1);
				append_dev(p0, span);
				insert_dev(target, t3, anchor);
				insert_dev(target, div1, anchor);
				mount_component(popinfo1, div1, null);
				insert_dev(target, t4, anchor);
				insert_dev(target, p1, anchor);
				insert_dev(target, t6, anchor);
				mount_component(heavyborderbox0, target, anchor);
				insert_dev(target, t7, anchor);
				mount_component(heavyborderbox1, target, anchor);
				insert_dev(target, t8, anchor);
				mount_component(heavyborderbox2, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const popinfo0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo0_changes.$$scope = { dirty, ctx };
				}

				popinfo0.$set(popinfo0_changes);
				const popinfo1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					popinfo1_changes.$$scope = { dirty, ctx };
				}

				popinfo1.$set(popinfo1_changes);
				const heavyborderbox0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					heavyborderbox0_changes.$$scope = { dirty, ctx };
				}

				heavyborderbox0.$set(heavyborderbox0_changes);
				const heavyborderbox1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					heavyborderbox1_changes.$$scope = { dirty, ctx };
				}

				heavyborderbox1.$set(heavyborderbox1_changes);
				const heavyborderbox2_changes = {};

				if (dirty & /*$$scope*/ 64) {
					heavyborderbox2_changes.$$scope = { dirty, ctx };
				}

				heavyborderbox2.$set(heavyborderbox2_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(popinfo0.$$.fragment, local);
				transition_in(popinfo1.$$.fragment, local);
				transition_in(heavyborderbox0.$$.fragment, local);
				transition_in(heavyborderbox1.$$.fragment, local);
				transition_in(heavyborderbox2.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(popinfo0.$$.fragment, local);
				transition_out(popinfo1.$$.fragment, local);
				transition_out(heavyborderbox0.$$.fragment, local);
				transition_out(heavyborderbox1.$$.fragment, local);
				transition_out(heavyborderbox2.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
				destroy_component(popinfo0);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(p0);
				if (detaching) detach_dev(t3);
				if (detaching) detach_dev(div1);
				destroy_component(popinfo1);
				if (detaching) detach_dev(t4);
				if (detaching) detach_dev(p1);
				if (detaching) detach_dev(t6);
				destroy_component(heavyborderbox0, detaching);
				if (detaching) detach_dev(t7);
				destroy_component(heavyborderbox1, detaching);
				if (detaching) detach_dev(t8);
				destroy_component(heavyborderbox2, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$i.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$i($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Funding', slots, []);

		const cycleKeyValues = [
			{
				label: 'Distribution limit',
				value: 'Zero',
			},
			{ label: 'Duration', value: '14d' },
			{
				label: 'Start',
				value: '2022-04-30 8:43pm',
			},
			{ label: 'End', value: '2022-05-30 8:43pm' },
			{
				label: 'Discount rate',
				value: '0%',
				info: 'The ratio of tokens rewarded per payment amount will decrease by this percentage with each new funding cycle. A higher discount rate will incentivize supporters to pay your project earlier than later.',
			},
			{
				label: 'Redemption rate',
				value: '100%',
				info: 'This rate determines the amount of overflow that each token can be redeemed for at any given time. On a lower bonding curve, redeeming a token increases the value of each remaining token, creating an incentive to hold tokens longer than others. A redemption rate of 100% means all tokens will have equal value regardless of when they are redeemed.',
			},
			{
				label: 'Reserved tokens',
				value: '0%',
				info: 'Whenever someone pays your project, this percentage of tokens will be reserved and the rest will go to the payer. Reserve tokens are reserved for the project owner by default, but can also be allocated to other wallet addresses by the owner. Once tokens are reserved, anyone can "mint" them, which distributes them to their intended receivers.',
			},
			{
				label: 'Issuance rate',
				value: '1,000,000 tokens/ETH',
				info: 'Tokens received per ETH paid to the treasury. This can change over time according to the discount rate and reserved tokens amount of future funding cycles.',
			},
			{ label: 'Payments', value: 'Enabled' },
			{
				label: 'Token minting',
				value: 'Disabled',
				info: 'Token minting allows the project owner to mint project tokens at any time.',
			},
			{
				label: 'Reconfiguration strategy',
				value: '3-day delay',
				info: 'Rules for determining how funding cycles can be reconfigured.',
			},
		];

		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Funding> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			CollapsibleSection,
			ETH: Ethereum,
			HeavyBorderBox,
			Icon,
			InfoSpaceBetween,
			PopInfo,
			cycleKeyValues,
		});

		return [cycleKeyValues];
	}

	class Funding extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Funding',
				options,
				id: create_fragment$i.name,
			});
		}
	}

	/* src/Preview/InfoHeader.svelte generated by Svelte v3.48.0 */
	const file$f = 'src/Preview/InfoHeader.svelte';

	// (9:2) {:else}
	function create_else_block$1(ctx) {
		let div;

		const block = {
			c: function create() {
				div = element('div');
				div.textContent = '🧃';
				attr_dev(div, 'class', 'logo-placeholder svelte-1y10ud6');
				add_location(div, file$f, 9, 4, 319);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block$1.name,
			type: 'else',
			source: '(9:2) {:else}',
			ctx,
		});

		return block;
	}

	// (7:2) {#if $projectDetails.logo}
	function create_if_block_2$2(ctx) {
		let img;
		let img_src_value;

		const block = {
			c: function create() {
				img = element('img');
				attr_dev(img, 'class', 'logo svelte-1y10ud6');
				if (!src_url_equal(img.src, (img_src_value = /*$projectDetails*/ ctx[0].logo)))
					attr_dev(img, 'src', img_src_value);
				attr_dev(img, 'alt', 'Uploaded logo');
				add_location(img, file$f, 7, 4, 237);
			},
			m: function mount(target, anchor) {
				insert_dev(target, img, anchor);
			},
			p: function update(ctx, dirty) {
				if (
					dirty & /*$projectDetails*/ 1 &&
					!src_url_equal(img.src, (img_src_value = /*$projectDetails*/ ctx[0].logo))
				) {
					attr_dev(img, 'src', img_src_value);
				}
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(img);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_2$2.name,
			type: 'if',
			source: '(7:2) {#if $projectDetails.logo}',
			ctx,
		});

		return block;
	}

	// (16:6) {#if $projectDetails.twitter}
	function create_if_block_1$3(ctx) {
		let p;
		let icon;
		let t0;
		let t1_value = /*$projectDetails*/ ctx[0].twitter + '';
		let t1;
		let current;

		icon = new Icon({
			props: { name: 'twitter' },
			$$inline: true,
		});

		const block = {
			c: function create() {
				p = element('p');
				create_component(icon.$$.fragment);
				t0 = space();
				t1 = text(t1_value);
				attr_dev(p, 'class', 'svelte-1y10ud6');
				add_location(p, file$f, 16, 8, 569);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				mount_component(icon, p, null);
				append_dev(p, t0);
				append_dev(p, t1);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (
					(!current || dirty & /*$projectDetails*/ 1) &&
					t1_value !== (t1_value = /*$projectDetails*/ ctx[0].twitter + '')
				)
					set_data_dev(t1, t1_value);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1$3.name,
			type: 'if',
			source: '(16:6) {#if $projectDetails.twitter}',
			ctx,
		});

		return block;
	}

	// (22:6) {#if $projectDetails.discord}
	function create_if_block$7(ctx) {
		let p;
		let icon;
		let t0;
		let t1_value = /*$projectDetails*/ ctx[0].discord + '';
		let t1;
		let current;

		icon = new Icon({
			props: { name: 'discord' },
			$$inline: true,
		});

		const block = {
			c: function create() {
				p = element('p');
				create_component(icon.$$.fragment);
				t0 = space();
				t1 = text(t1_value);
				attr_dev(p, 'class', 'svelte-1y10ud6');
				add_location(p, file$f, 22, 8, 712);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				mount_component(icon, p, null);
				append_dev(p, t0);
				append_dev(p, t1);
				current = true;
			},
			p: function update(ctx, dirty) {
				if (
					(!current || dirty & /*$projectDetails*/ 1) &&
					t1_value !== (t1_value = /*$projectDetails*/ ctx[0].discord + '')
				)
					set_data_dev(t1, t1_value);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$7.name,
			type: 'if',
			source: '(22:6) {#if $projectDetails.discord}',
			ctx,
		});

		return block;
	}

	function create_fragment$h(ctx) {
		let div2;
		let t0;
		let div1;
		let h1;
		let t1_value = /*$projectDetails*/ (ctx[0].name || 'Untitled project') + '';
		let t1;
		let t2;
		let div0;
		let p0;
		let t3_value = /*$projectDetails*/ (ctx[0].website || '') + '';
		let t3;
		let t4;
		let t5;
		let t6;
		let p1;
		let t7_value = /*$projectDetails*/ (ctx[0].description || '') + '';
		let t7;
		let current;

		function select_block_type(ctx, dirty) {
			if (/*$projectDetails*/ ctx[0].logo) return create_if_block_2$2;
			return create_else_block$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block0 = current_block_type(ctx);
		let if_block1 = /*$projectDetails*/ ctx[0].twitter && create_if_block_1$3(ctx);
		let if_block2 = /*$projectDetails*/ ctx[0].discord && create_if_block$7(ctx);

		const block = {
			c: function create() {
				div2 = element('div');
				if_block0.c();
				t0 = space();
				div1 = element('div');
				h1 = element('h1');
				t1 = text(t1_value);
				t2 = space();
				div0 = element('div');
				p0 = element('p');
				t3 = text(t3_value);
				t4 = space();
				if (if_block1) if_block1.c();
				t5 = space();
				if (if_block2) if_block2.c();
				t6 = space();
				p1 = element('p');
				t7 = text(t7_value);
				attr_dev(h1, 'class', 'svelte-1y10ud6');
				add_location(h1, file$f, 12, 4, 396);
				attr_dev(p0, 'class', 'svelte-1y10ud6');
				add_location(p0, file$f, 14, 6, 486);
				attr_dev(div0, 'class', 'social-list svelte-1y10ud6');
				add_location(div0, file$f, 13, 4, 454);
				attr_dev(p1, 'class', 'description svelte-1y10ud6');
				add_location(p1, file$f, 28, 4, 826);
				attr_dev(div1, 'class', 'info-text svelte-1y10ud6');
				add_location(div1, file$f, 11, 2, 368);
				attr_dev(div2, 'class', 'info svelte-1y10ud6');
				add_location(div2, file$f, 5, 0, 185);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div2, anchor);
				if_block0.m(div2, null);
				append_dev(div2, t0);
				append_dev(div2, div1);
				append_dev(div1, h1);
				append_dev(h1, t1);
				append_dev(div1, t2);
				append_dev(div1, div0);
				append_dev(div0, p0);
				append_dev(p0, t3);
				append_dev(div0, t4);
				if (if_block1) if_block1.m(div0, null);
				append_dev(div0, t5);
				if (if_block2) if_block2.m(div0, null);
				append_dev(div1, t6);
				append_dev(div1, p1);
				append_dev(p1, t7);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
					if_block0.p(ctx, dirty);
				} else {
					if_block0.d(1);
					if_block0 = current_block_type(ctx);

					if (if_block0) {
						if_block0.c();
						if_block0.m(div2, t0);
					}
				}

				if (
					(!current || dirty & /*$projectDetails*/ 1) &&
					t1_value !== (t1_value = /*$projectDetails*/ (ctx[0].name || 'Untitled project') + '')
				)
					set_data_dev(t1, t1_value);
				if (
					(!current || dirty & /*$projectDetails*/ 1) &&
					t3_value !== (t3_value = /*$projectDetails*/ (ctx[0].website || '') + '')
				)
					set_data_dev(t3, t3_value);

				if (/*$projectDetails*/ ctx[0].twitter) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*$projectDetails*/ 1) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block_1$3(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(div0, t5);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				if (/*$projectDetails*/ ctx[0].discord) {
					if (if_block2) {
						if_block2.p(ctx, dirty);

						if (dirty & /*$projectDetails*/ 1) {
							transition_in(if_block2, 1);
						}
					} else {
						if_block2 = create_if_block$7(ctx);
						if_block2.c();
						transition_in(if_block2, 1);
						if_block2.m(div0, null);
					}
				} else if (if_block2) {
					group_outros();

					transition_out(if_block2, 1, 1, () => {
						if_block2 = null;
					});

					check_outros();
				}

				if (
					(!current || dirty & /*$projectDetails*/ 1) &&
					t7_value !== (t7_value = /*$projectDetails*/ (ctx[0].description || '') + '')
				)
					set_data_dev(t7, t7_value);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block1);
				transition_in(if_block2);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block1);
				transition_out(if_block2);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div2);
				if_block0.d();
				if (if_block1) if_block1.d();
				if (if_block2) if_block2.d();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$h.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$h($$self, $$props, $$invalidate) {
		let $projectDetails;
		validate_store(projectDetails, 'projectDetails');
		component_subscribe($$self, projectDetails, ($$value) =>
			$$invalidate(0, ($projectDetails = $$value)),
		);
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('InfoHeader', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<InfoHeader> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ projectDetails, Icon, $projectDetails });
		return [$projectDetails];
	}

	class InfoHeader extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$h, create_fragment$h, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'InfoHeader',
				options,
				id: create_fragment$h.name,
			});
		}
	}

	/* src/Preview/Pay.svelte generated by Svelte v3.48.0 */

	const { console: console_1$1 } = globals;
	const file$e = 'src/Preview/Pay.svelte';

	// (36:4) <Button size="md" onClick={console.log}       >
	function create_default_slot$4(ctx) {
		let t_value = /*$projectDetails*/ ctx[3].payButtonText + '';
		let t;

		const block = {
			c: function create() {
				t = text(t_value);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			p: function update(ctx, dirty) {
				if (
					dirty & /*$projectDetails*/ 8 &&
					t_value !== (t_value = /*$projectDetails*/ ctx[3].payButtonText + '')
				)
					set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$4.name,
			type: 'slot',
			source: '(36:4) <Button size=\\"md\\" onClick={console.log}       >',
			ctx,
		});

		return block;
	}

	// (39:4) {#if currency === Currency.USD}
	function create_if_block$6(ctx) {
		let small;
		let t0;
		let eth;
		let t1;
		let current;
		eth = new Ethereum({ $$inline: true });

		const block = {
			c: function create() {
				small = element('small');
				t0 = text('Paid as ');
				create_component(eth.$$.fragment);
				t1 = text('0.00071584');
				add_location(small, file$e, 39, 6, 1136);
			},
			m: function mount(target, anchor) {
				insert_dev(target, small, anchor);
				append_dev(small, t0);
				mount_component(eth, small, null);
				append_dev(small, t1);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(eth.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(eth.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(small);
				destroy_component(eth);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$6.name,
			type: 'if',
			source: '(39:4) {#if currency === Currency.USD}',
			ctx,
		});

		return block;
	}

	function create_fragment$g(ctx) {
		let div4;
		let div2;
		let div1;
		let input;
		let t0;
		let div0;
		let t1;
		let t2;
		let icon;
		let t3;
		let small;
		let t4;
		let t5;
		let div3;
		let button;
		let t6;
		let current;
		let mounted;
		let dispose;

		icon = new Icon({
			props: { name: 'caret', direction: 'e' },
			$$inline: true,
		});

		button = new Button({
			props: {
				size: 'md',
				onClick: console.log,
				$$slots: { default: [create_default_slot$4] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		let if_block = /*currency*/ ctx[1] === /*Currency*/ ctx[0].USD && create_if_block$6(ctx);

		const block = {
			c: function create() {
				div4 = element('div');
				div2 = element('div');
				div1 = element('div');
				input = element('input');
				t0 = space();
				div0 = element('div');
				t1 = text(/*currency*/ ctx[1]);
				t2 = space();
				create_component(icon.$$.fragment);
				t3 = space();
				small = element('small');
				t4 = text(/*receiveText*/ ctx[2]);
				t5 = space();
				div3 = element('div');
				create_component(button.$$.fragment);
				t6 = space();
				if (if_block) if_block.c();
				attr_dev(input, 'placeholder', '0');
				attr_dev(input, 'class', 'svelte-eyodks');
				add_location(input, file$e, 26, 6, 749);
				attr_dev(div0, 'role', 'button');
				attr_dev(div0, 'class', 'currency svelte-eyodks');
				add_location(div0, file$e, 27, 6, 781);
				attr_dev(div1, 'class', 'input-container svelte-eyodks');
				add_location(div1, file$e, 25, 4, 713);
				add_location(small, file$e, 32, 4, 935);
				attr_dev(div2, 'class', 'stacked expand svelte-eyodks');
				add_location(div2, file$e, 24, 2, 680);
				attr_dev(div3, 'class', 'stacked svelte-eyodks');
				add_location(div3, file$e, 34, 2, 975);
				attr_dev(div4, 'class', 'wrapper svelte-eyodks');
				add_location(div4, file$e, 23, 0, 656);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div4, anchor);
				append_dev(div4, div2);
				append_dev(div2, div1);
				append_dev(div1, input);
				append_dev(div1, t0);
				append_dev(div1, div0);
				append_dev(div0, t1);
				append_dev(div0, t2);
				mount_component(icon, div0, null);
				append_dev(div2, t3);
				append_dev(div2, small);
				append_dev(small, t4);
				append_dev(div4, t5);
				append_dev(div4, div3);
				mount_component(button, div3, null);
				append_dev(div3, t6);
				if (if_block) if_block.m(div3, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(div0, 'click', /*switchCurrency*/ ctx[4], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*currency*/ 2) set_data_dev(t1, /*currency*/ ctx[1]);
				if (!current || dirty & /*receiveText*/ 4) set_data_dev(t4, /*receiveText*/ ctx[2]);
				const button_changes = {};

				if (dirty & /*$$scope, $projectDetails*/ 40) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);

				if (/*currency*/ ctx[1] === /*Currency*/ ctx[0].USD) {
					if (if_block) {
						if (dirty & /*currency, Currency*/ 3) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$6(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(div3, null);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				transition_in(button.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				transition_out(button.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div4);
				destroy_component(icon);
				destroy_component(button);
				if (if_block) if_block.d();
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$g.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$g($$self, $$props, $$invalidate) {
		let $projectDetails;
		validate_store(projectDetails, 'projectDetails');
		component_subscribe($$self, projectDetails, ($$value) =>
			$$invalidate(3, ($projectDetails = $$value)),
		);
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Pay', slots, []);
		var Currency;

		(function (Currency) {
			Currency['ETH'] = 'ETH';
			Currency['USD'] = 'USD';
		})(Currency || (Currency = {}));

		let currency = Currency.ETH;
		let receiveText = 'Receive 1,000,000 tokens/1 ETH';

		function switchCurrency() {
			if (currency === Currency.ETH) {
				$$invalidate(1, (currency = Currency.USD));
				$$invalidate(2, (receiveText = 'Receive 357 tokens/1 USD'));
			} else {
				$$invalidate(1, (currency = Currency.ETH));
				$$invalidate(2, (receiveText = 'Receive 1,000,000 tokens/1 ETH'));
			}
		}

		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console_1$1.warn(`<Pay> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			projectDetails,
			Button,
			Icon,
			ETH: Ethereum,
			Currency,
			currency,
			receiveText,
			switchCurrency,
			$projectDetails,
		});

		$$self.$inject_state = ($$props) => {
			if ('Currency' in $$props) $$invalidate(0, (Currency = $$props.Currency));
			if ('currency' in $$props) $$invalidate(1, (currency = $$props.currency));
			if ('receiveText' in $$props) $$invalidate(2, (receiveText = $$props.receiveText));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [Currency, currency, receiveText, $projectDetails, switchCurrency];
	}

	class Pay extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Pay',
				options,
				id: create_fragment$g.name,
			});
		}
	}

	/* src/Preview/Main.svelte generated by Svelte v3.48.0 */
	const file$d = 'src/Preview/Main.svelte';

	function create_fragment$f(ctx) {
		let h1;
		let t1;
		let infoheader;
		let t2;
		let cashmoney;
		let t3;
		let pay;
		let t4;
		let funding;
		let current;
		infoheader = new InfoHeader({ $$inline: true });
		cashmoney = new CashMoney({ $$inline: true });
		pay = new Pay({ $$inline: true });
		funding = new Funding({ $$inline: true });

		const block = {
			c: function create() {
				h1 = element('h1');
				h1.textContent = 'Preview:';
				t1 = space();
				create_component(infoheader.$$.fragment);
				t2 = space();
				create_component(cashmoney.$$.fragment);
				t3 = space();
				create_component(pay.$$.fragment);
				t4 = space();
				create_component(funding.$$.fragment);
				attr_dev(h1, 'class', 'title svelte-1f0yomb');
				add_location(h1, file$d, 6, 0, 191);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
				insert_dev(target, t1, anchor);
				mount_component(infoheader, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(cashmoney, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(pay, target, anchor);
				insert_dev(target, t4, anchor);
				mount_component(funding, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(infoheader.$$.fragment, local);
				transition_in(cashmoney.$$.fragment, local);
				transition_in(pay.$$.fragment, local);
				transition_in(funding.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(infoheader.$$.fragment, local);
				transition_out(cashmoney.$$.fragment, local);
				transition_out(pay.$$.fragment, local);
				transition_out(funding.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(h1);
				if (detaching) detach_dev(t1);
				destroy_component(infoheader, detaching);
				if (detaching) detach_dev(t2);
				destroy_component(cashmoney, detaching);
				if (detaching) detach_dev(t3);
				destroy_component(pay, detaching);
				if (detaching) detach_dev(t4);
				destroy_component(funding, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$f.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$f($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Main', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Main> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({ CashMoney, Funding, InfoHeader, Pay });
		return [];
	}

	class Main extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Main',
				options,
				id: create_fragment$f.name,
			});
		}
	}

	/* src/InfoBox.svelte generated by Svelte v3.48.0 */
	const file$c = 'src/InfoBox.svelte';

	function create_fragment$e(ctx) {
		let aside;
		let div;
		let icon;
		let t;
		let p;
		let current;

		icon = new Icon({
			props: { name: 'infoCircle' },
			$$inline: true,
		});

		const block = {
			c: function create() {
				aside = element('aside');
				div = element('div');
				create_component(icon.$$.fragment);
				t = space();
				p = element('p');
				attr_dev(div, 'class', 'icon svelte-h01e0w');
				add_location(div, file$c, 6, 2, 85);
				attr_dev(p, 'class', 'svelte-h01e0w');
				add_location(p, file$c, 9, 2, 146);
				attr_dev(aside, 'class', 'svelte-h01e0w');
				add_location(aside, file$c, 5, 0, 75);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, aside, anchor);
				append_dev(aside, div);
				mount_component(icon, div, null);
				append_dev(aside, t);
				append_dev(aside, p);
				p.innerHTML = /*info*/ ctx[0];
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (!current || dirty & /*info*/ 1) p.innerHTML = /*info*/ ctx[0];
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(aside);
				destroy_component(icon);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$e.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$e($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('InfoBox', slots, []);
		let { info } = $$props;
		const writable_props = ['info'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<InfoBox> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('info' in $$props) $$invalidate(0, (info = $$props.info));
		};

		$$self.$capture_state = () => ({ Icon, info });

		$$self.$inject_state = ($$props) => {
			if ('info' in $$props) $$invalidate(0, (info = $$props.info));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [info];
	}

	class InfoBox extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$e, create_fragment$e, safe_not_equal, { info: 0 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'InfoBox',
				options,
				id: create_fragment$e.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*info*/ ctx[0] === undefined && !('info' in props)) {
				console.warn("<InfoBox> was created without expected prop 'info'");
			}
		}

		get info() {
			throw new Error(
				"<InfoBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set info(value) {
			throw new Error(
				"<InfoBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/FormField.svelte generated by Svelte v3.48.0 */

	const file$b = 'src/FormField.svelte';

	// (8:2) {#if field.props?.required}
	function create_if_block_4(ctx) {
		let small;

		const block = {
			c: function create() {
				small = element('small');
				small.textContent = '*';
				attr_dev(small, 'class', 'svelte-8c0h2o');
				add_location(small, file$b, 7, 29, 278);
			},
			m: function mount(target, anchor) {
				insert_dev(target, small, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(small);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_4.name,
			type: 'if',
			source: '(8:2) {#if field.props?.required}',
			ctx,
		});

		return block;
	}

	// (12:2) {#if field.prefix}
	function create_if_block_3(ctx) {
		let div;
		let t_value = /*field*/ ctx[0].prefix + '';
		let t;

		const block = {
			c: function create() {
				div = element('div');
				t = text(t_value);
				attr_dev(div, 'class', 'prefix svelte-8c0h2o');
				add_location(div, file$b, 11, 21, 376);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*field*/ 1 && t_value !== (t_value = /*field*/ ctx[0].prefix + ''))
					set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_3.name,
			type: 'if',
			source: '(12:2) {#if field.prefix}',
			ctx,
		});

		return block;
	}

	// (20:38)
	function create_if_block_2$1(ctx) {
		let textarea;
		let textarea_id_value;
		let textarea_placeholder_value;
		let mounted;
		let dispose;

		let textarea_levels = [
			{
				id: (textarea_id_value = /*field*/ ctx[0].id),
			},
			{
				placeholder: (textarea_placeholder_value = /*field*/ ctx[0].placeholder),
			},
			/*field*/ ctx[0].props,
		];

		let textarea_data = {};

		for (let i = 0; i < textarea_levels.length; i += 1) {
			textarea_data = assign(textarea_data, textarea_levels[i]);
		}

		const block = {
			c: function create() {
				textarea = element('textarea');
				set_attributes(textarea, textarea_data);
				toggle_class(textarea, 'svelte-8c0h2o', true);
				add_location(textarea, file$b, 20, 4, 651);
			},
			m: function mount(target, anchor) {
				insert_dev(target, textarea, anchor);
				if (textarea.autofocus) textarea.focus();
				set_input_value(textarea, /*$dataStore*/ ctx[2][/*field*/ ctx[0].id]);

				if (!mounted) {
					dispose = listen_dev(textarea, 'input', /*textarea_input_handler*/ ctx[4]);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				set_attributes(
					textarea,
					(textarea_data = get_spread_update(textarea_levels, [
						dirty & /*field*/ 1 &&
							textarea_id_value !== (textarea_id_value = /*field*/ ctx[0].id) && {
								id: textarea_id_value,
							},
						dirty & /*field*/ 1 &&
							textarea_placeholder_value !==
								(textarea_placeholder_value = /*field*/ ctx[0].placeholder) && {
								placeholder: textarea_placeholder_value,
							},
						dirty & /*field*/ 1 && /*field*/ ctx[0].props,
					])),
				);

				if (dirty & /*$dataStore, field*/ 5) {
					set_input_value(textarea, /*$dataStore*/ ctx[2][/*field*/ ctx[0].id]);
				}

				toggle_class(textarea, 'svelte-8c0h2o', true);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(textarea);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_2$1.name,
			type: 'if',
			source: '(20:38) ',
			ctx,
		});

		return block;
	}

	// (13:2) {#if field.type === "input" || !field.type}
	function create_if_block_1$2(ctx) {
		let input;
		let input_id_value;
		let input_placeholder_value;
		let mounted;
		let dispose;

		let input_levels = [
			{ id: (input_id_value = /*field*/ ctx[0].id) },
			{
				placeholder: (input_placeholder_value = /*field*/ ctx[0].placeholder),
			},
			/*field*/ ctx[0].props,
		];

		let input_data = {};

		for (let i = 0; i < input_levels.length; i += 1) {
			input_data = assign(input_data, input_levels[i]);
		}

		const block = {
			c: function create() {
				input = element('input');
				set_attributes(input, input_data);
				toggle_class(input, 'svelte-8c0h2o', true);
				add_location(input, file$b, 13, 4, 473);
			},
			m: function mount(target, anchor) {
				insert_dev(target, input, anchor);
				if (input.autofocus) input.focus();
				set_input_value(input, /*$dataStore*/ ctx[2][/*field*/ ctx[0].id]);

				if (!mounted) {
					dispose = listen_dev(input, 'input', /*input_input_handler*/ ctx[3]);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				set_attributes(
					input,
					(input_data = get_spread_update(input_levels, [
						dirty & /*field*/ 1 &&
							input_id_value !== (input_id_value = /*field*/ ctx[0].id) && { id: input_id_value },
						dirty & /*field*/ 1 &&
							input_placeholder_value !==
								(input_placeholder_value = /*field*/ ctx[0].placeholder) && {
								placeholder: input_placeholder_value,
							},
						dirty & /*field*/ 1 && /*field*/ ctx[0].props,
					])),
				);

				if (
					dirty & /*$dataStore, field*/ 5 &&
					input.value !== /*$dataStore*/ ctx[2][/*field*/ ctx[0].id]
				) {
					set_input_value(input, /*$dataStore*/ ctx[2][/*field*/ ctx[0].id]);
				}

				toggle_class(input, 'svelte-8c0h2o', true);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(input);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1$2.name,
			type: 'if',
			source: '(13:2) {#if field.type === \\"input\\" || !field.type}',
			ctx,
		});

		return block;
	}

	// (29:0) {#if field.description}
	function create_if_block$5(ctx) {
		let p;
		let t_value = /*field*/ ctx[0].description + '';
		let t;

		const block = {
			c: function create() {
				p = element('p');
				t = text(t_value);
				attr_dev(p, 'class', 'description svelte-8c0h2o');
				add_location(p, file$b, 29, 2, 830);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				append_dev(p, t);
			},
			p: function update(ctx, dirty) {
				if (dirty & /*field*/ 1 && t_value !== (t_value = /*field*/ ctx[0].description + ''))
					set_data_dev(t, t_value);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$5.name,
			type: 'if',
			source: '(29:0) {#if field.description}',
			ctx,
		});

		return block;
	}

	function create_fragment$d(ctx) {
		let label;
		let t0;
		let t1_value = /*field*/ ctx[0].label + '';
		let t1;
		let label_for_value;
		let t2;
		let div;
		let t3;
		let t4;
		let if_block3_anchor;
		let if_block0 = /*field*/ ctx[0].props?.required && create_if_block_4(ctx);
		let if_block1 = /*field*/ ctx[0].prefix && create_if_block_3(ctx);

		function select_block_type(ctx, dirty) {
			if (/*field*/ ctx[0].type === 'input' || !(/*field*/ ctx[0].type)) return create_if_block_1$2;
			if (/*field*/ ctx[0].type === 'textarea') return create_if_block_2$1;
		}

		let current_block_type = select_block_type(ctx);
		let if_block2 = current_block_type && current_block_type(ctx);
		let if_block3 = /*field*/ ctx[0].description && create_if_block$5(ctx);

		const block = {
			c: function create() {
				label = element('label');
				if (if_block0) if_block0.c();
				t0 = space();
				t1 = text(t1_value);
				t2 = space();
				div = element('div');
				if (if_block1) if_block1.c();
				t3 = space();
				if (if_block2) if_block2.c();
				t4 = space();
				if (if_block3) if_block3.c();
				if_block3_anchor = empty();
				attr_dev(label, 'for', (label_for_value = /*field*/ ctx[0].id));
				attr_dev(label, 'class', 'svelte-8c0h2o');
				add_location(label, file$b, 6, 0, 226);
				attr_dev(div, 'class', 'input-container svelte-8c0h2o');
				add_location(div, file$b, 10, 0, 325);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, label, anchor);
				if (if_block0) if_block0.m(label, null);
				append_dev(label, t0);
				append_dev(label, t1);
				insert_dev(target, t2, anchor);
				insert_dev(target, div, anchor);
				if (if_block1) if_block1.m(div, null);
				append_dev(div, t3);
				if (if_block2) if_block2.m(div, null);
				insert_dev(target, t4, anchor);
				if (if_block3) if_block3.m(target, anchor);
				insert_dev(target, if_block3_anchor, anchor);
			},
			p: function update(ctx, [dirty]) {
				if (/*field*/ ctx[0].props?.required) {
					if (if_block0);
					else {
						if_block0 = create_if_block_4(ctx);
						if_block0.c();
						if_block0.m(label, t0);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (dirty & /*field*/ 1 && t1_value !== (t1_value = /*field*/ ctx[0].label + ''))
					set_data_dev(t1, t1_value);

				if (dirty & /*field*/ 1 && label_for_value !== (label_for_value = /*field*/ ctx[0].id)) {
					attr_dev(label, 'for', label_for_value);
				}

				if (/*field*/ ctx[0].prefix) {
					if (if_block1) {
						if_block1.p(ctx, dirty);
					} else {
						if_block1 = create_if_block_3(ctx);
						if_block1.c();
						if_block1.m(div, t3);
					}
				} else if (if_block1) {
					if_block1.d(1);
					if_block1 = null;
				}

				if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block2) {
					if_block2.p(ctx, dirty);
				} else {
					if (if_block2) if_block2.d(1);
					if_block2 = current_block_type && current_block_type(ctx);

					if (if_block2) {
						if_block2.c();
						if_block2.m(div, null);
					}
				}

				if (/*field*/ ctx[0].description) {
					if (if_block3) {
						if_block3.p(ctx, dirty);
					} else {
						if_block3 = create_if_block$5(ctx);
						if_block3.c();
						if_block3.m(if_block3_anchor.parentNode, if_block3_anchor);
					}
				} else if (if_block3) {
					if_block3.d(1);
					if_block3 = null;
				}
			},
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(label);
				if (if_block0) if_block0.d();
				if (detaching) detach_dev(t2);
				if (detaching) detach_dev(div);
				if (if_block1) if_block1.d();

				if (if_block2) {
					if_block2.d();
				}

				if (detaching) detach_dev(t4);
				if (if_block3) if_block3.d(detaching);
				if (detaching) detach_dev(if_block3_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$d.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$d($$self, $$props, $$invalidate) {
		let $dataStore,
			$$unsubscribe_dataStore = noop,
			$$subscribe_dataStore = () => (
				$$unsubscribe_dataStore(),
				($$unsubscribe_dataStore = subscribe(dataStore, ($$value) =>
					$$invalidate(2, ($dataStore = $$value)),
				)),
				dataStore
			);

		$$self.$$.on_destroy.push(() => $$unsubscribe_dataStore());
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FormField', slots, []);
		let { field } = $$props;
		let { dataStore } = $$props;
		validate_store(dataStore, 'dataStore');
		$$subscribe_dataStore();
		const writable_props = ['field', 'dataStore'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<FormField> was created with unknown prop '${key}'`);
		});

		function input_input_handler() {
			$dataStore[field.id] = this.value;
			dataStore.set($dataStore);
		}

		function textarea_input_handler() {
			$dataStore[field.id] = this.value;
			dataStore.set($dataStore);
		}

		$$self.$$set = ($$props) => {
			if ('field' in $$props) $$invalidate(0, (field = $$props.field));
			if ('dataStore' in $$props)
				$$subscribe_dataStore($$invalidate(1, (dataStore = $$props.dataStore)));
		};

		$$self.$capture_state = () => ({ field, dataStore, $dataStore });

		$$self.$inject_state = ($$props) => {
			if ('field' in $$props) $$invalidate(0, (field = $$props.field));
			if ('dataStore' in $$props)
				$$subscribe_dataStore($$invalidate(1, (dataStore = $$props.dataStore)));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [field, dataStore, $dataStore, input_input_handler, textarea_input_handler];
	}

	class FormField extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$d, create_fragment$d, safe_not_equal, {
				field: 0,
				dataStore: 1,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'FormField',
				options,
				id: create_fragment$d.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*field*/ ctx[0] === undefined && !('field' in props)) {
				console.warn("<FormField> was created without expected prop 'field'");
			}

			if (/*dataStore*/ ctx[1] === undefined && !('dataStore' in props)) {
				console.warn("<FormField> was created without expected prop 'dataStore'");
			}
		}

		get field() {
			throw new Error(
				"<FormField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set field(value) {
			throw new Error(
				"<FormField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get dataStore() {
			throw new Error(
				"<FormField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set dataStore(value) {
			throw new Error(
				"<FormField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/UploadField.svelte generated by Svelte v3.48.0 */
	const file_1 = 'src/UploadField.svelte';

	function create_fragment$c(ctx) {
		let label;
		let t0;
		let input;
		let t1;
		let div;
		let icon;
		let t2;
		let span;
		let t4;
		let img;
		let img_class_value;
		let img_src_value;
		let current;

		icon = new Icon({
			props: { name: 'fileImage' },
			$$inline: true,
		});

		const block = {
			c: function create() {
				label = element('label');
				t0 = text('Logo\n');
				input = element('input');
				t1 = space();
				div = element('div');
				create_component(icon.$$.fragment);
				t2 = space();
				span = element('span');
				span.textContent = 'Upload';
				t4 = space();
				img = element('img');
				attr_dev(input, 'id', 'icon');
				attr_dev(input, 'type', 'file');
				attr_dev(input, 'class', 'svelte-17t0ude');
				add_location(input, file_1, 34, 0, 964);
				add_location(span, file_1, 37, 4, 1053);
				attr_dev(div, 'class', 'svelte-17t0ude');
				add_location(div, file_1, 35, 0, 1013);
				attr_dev(label, 'for', 'icon');
				add_location(label, file_1, 32, 0, 940);
				attr_dev(img, 'id', 'output');
				attr_dev(
					img,
					'class',
					(img_class_value =
						'' + (null_to_empty(/*isFileSet*/ ctx[1] && 'file-preview') + ' svelte-17t0ude')),
				);
				if (!src_url_equal(img.src, (img_src_value = ''))) attr_dev(img, 'src', img_src_value);
				attr_dev(img, 'alt', 'Uploaded logo');
				add_location(img, file_1, 40, 0, 1089);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, label, anchor);
				append_dev(label, t0);
				append_dev(label, input);
				/*input_binding*/ ctx[3](input);
				append_dev(label, t1);
				append_dev(label, div);
				mount_component(icon, div, null);
				append_dev(div, t2);
				append_dev(div, span);
				insert_dev(target, t4, anchor);
				insert_dev(target, img, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (
					!current ||
					(dirty & /*isFileSet*/ 2 &&
						img_class_value !==
							(img_class_value =
								'' + (null_to_empty(/*isFileSet*/ ctx[1] && 'file-preview') + ' svelte-17t0ude')))
				) {
					attr_dev(img, 'class', img_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(label);
				/*input_binding*/ ctx[3](null);
				destroy_component(icon);
				if (detaching) detach_dev(t4);
				if (detaching) detach_dev(img);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$c.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$c($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('UploadField', slots, []);
		let { onChange } = $$props;
		let file;
		let isFileSet = false;

		onMount(() => {
			file.addEventListener('change', (e) => {
				// Get the selected file
				const [file] = e.target.files;

				// Get the file name and size
				const { name: fileName, size } = file;

				// Convert size in bytes to kilo bytes
				const fileSize = (size / 1000).toFixed(2);

				// Set the text content
				const fileNameAndSize = `${fileName} - ${fileSize}KB`;

				loadFile(file);
				document.querySelector('.file-name').textContent = fileNameAndSize;
			});
		});

		var loadFile = function (file) {
			// Get src url
			const src = URL.createObjectURL(file);

			if (onChange) {
				onChange(src);
			}

			// Set preview image
			let image = document.getElementById('output');

			image.src = src;
			$$invalidate(1, (isFileSet = true));
		};

		const writable_props = ['onChange'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<UploadField> was created with unknown prop '${key}'`);
		});

		function input_binding($$value) {
			binding_callbacks[$$value ? 'unshift' : 'push'](() => {
				file = $$value;
				$$invalidate(0, file);
			});
		}

		$$self.$$set = ($$props) => {
			if ('onChange' in $$props) $$invalidate(2, (onChange = $$props.onChange));
		};

		$$self.$capture_state = () => ({
			onMount,
			Icon,
			onChange,
			file,
			isFileSet,
			loadFile,
		});

		$$self.$inject_state = ($$props) => {
			if ('onChange' in $$props) $$invalidate(2, (onChange = $$props.onChange));
			if ('file' in $$props) $$invalidate(0, (file = $$props.file));
			if ('isFileSet' in $$props) $$invalidate(1, (isFileSet = $$props.isFileSet));
			if ('loadFile' in $$props) loadFile = $$props.loadFile;
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [file, isFileSet, onChange, input_binding];
	}

	class UploadField extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$c, create_fragment$c, safe_not_equal, { onChange: 2 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'UploadField',
				options,
				id: create_fragment$c.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*onChange*/ ctx[2] === undefined && !('onChange' in props)) {
				console.warn("<UploadField> was created without expected prop 'onChange'");
			}
		}

		get onChange() {
			throw new Error(
				"<UploadField>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set onChange(value) {
			throw new Error(
				"<UploadField>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/ProjectDetails.svelte generated by Svelte v3.48.0 */

	const { Object: Object_1$1 } = globals;

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[2] = list[i];
		return child_ctx;
	}

	// (68:0) {#each formFields as field}
	function create_each_block$1(ctx) {
		let input;
		let current;

		input = new FormField({
			props: {
				field: /*field*/ ctx[2],
				dataStore: projectDetails,
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(input.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(input, target, anchor);
				current = true;
			},
			p: noop,
			i: function intro(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(input, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block$1.name,
			type: 'each',
			source: '(68:0) {#each formFields as field}',
			ctx,
		});

		return block;
	}

	function create_fragment$b(ctx) {
		let infobox;
		let t0;
		let t1;
		let uploadfield;
		let current;

		infobox = new InfoBox({
			props: {
				info: 'You can edit your project details later on at any time.',
			},
			$$inline: true,
		});

		let each_value = /*formFields*/ ctx[1];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
		}

		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});

		uploadfield = new UploadField({
			props: { onChange: /*onLogoChange*/ ctx[0] },
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(infobox.$$.fragment);
				t0 = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();
				create_component(uploadfield.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				mount_component(infobox, target, anchor);
				insert_dev(target, t0, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(target, anchor);
				}

				insert_dev(target, t1, anchor);
				mount_component(uploadfield, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*formFields, projectDetails*/ 2) {
					each_value = /*formFields*/ ctx[1];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$1(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$1(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(t1.parentNode, t1);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(infobox.$$.fragment, local);

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(uploadfield.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(infobox.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(uploadfield.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(infobox, detaching);
				if (detaching) detach_dev(t0);
				destroy_each(each_blocks, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(uploadfield, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$b.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$b($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('ProjectDetails', slots, []);

		function onLogoChange(src) {
			projectDetails.update((state) => Object.assign(Object.assign({}, state), { logo: src }));
		}

		const formFields = [
			{
				id: 'name',
				label: 'Project name',
				placeholder: "Peach's Juicebox Stand",
				props: { required: true },
			},
			{
				id: 'description',
				label: 'Project description',
				placeholder: '1000 characters max',
				type: 'textarea',
				props: { maxlength: 10000 },
			},
			{
				id: 'website',
				label: 'Website',
				placeholder: 'https://your-project.com',
				description: "Your project's website",
				props: { type: 'url' },
			},
			{
				id: 'twitter',
				label: 'Twitter',
				prefix: '@',
				placeholder: 'your-project',
				description: "Your project's Twitter handle",
			},
			{
				id: 'discord',
				label: 'Discord',
				placeholder: 'https://discord.gg/abcdefgh',
				description: "An invite link to your project's Discord server",
				props: { type: 'url' },
			},
			{
				id: 'payButtonText',
				label: 'Pay button text',
				placeholder: 'Pay',
				description:
					'Text displayed on your project\'s "pay" button. Leave this blank to use the default.',
			},
			{
				id: 'payDisclosure',
				label: 'Pay disclosure',
				placeholder: 'Payment disclosure',
				description:
					'This text will be displayed to your supporters before they complete their payment.',
				type: 'textarea',
			},
		];

		const writable_props = [];

		Object_1$1.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<ProjectDetails> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			projectDetails,
			InfoBox,
			Input: FormField,
			UploadField,
			onLogoChange,
			formFields,
		});

		return [onLogoChange, formFields];
	}

	class ProjectDetails extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'ProjectDetails',
				options,
				id: create_fragment$b.name,
			});
		}
	}

	/* src/DescriptiveNumberedButton.svelte generated by Svelte v3.48.0 */
	const file$a = 'src/DescriptiveNumberedButton.svelte';

	// (21:2) {:else}
	function create_else_block(ctx) {
		let icon;
		let current;
		icon = new Icon({ props: { name: 'caret' }, $$inline: true });

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_else_block.name,
			type: 'else',
			source: '(21:2) {:else}',
			ctx,
		});

		return block;
	}

	// (19:2) {#if visited}
	function create_if_block$4(ctx) {
		let icon;
		let current;

		icon = new Icon({
			props: { name: 'checkCircle' },
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(icon.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(icon, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(icon, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$4.name,
			type: 'if',
			source: '(19:2) {#if visited}',
			ctx,
		});

		return block;
	}

	function create_fragment$a(ctx) {
		let div5;
		let div0;
		let t0;
		let t1;
		let div3;
		let div1;
		let t2;
		let t3;
		let div2;
		let t4;
		let t5;
		let div4;
		let current_block_type_index;
		let if_block;
		let div5_class_value;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block$4, create_else_block];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*visited*/ ctx[4]) return 0;
			return 1;
		}

		current_block_type_index = select_block_type(ctx);
		if_block = if_blocks[current_block_type_index] =
			if_block_creators[current_block_type_index](ctx);

		const block = {
			c: function create() {
				div5 = element('div');
				div0 = element('div');
				t0 = text(/*number*/ ctx[1]);
				t1 = space();
				div3 = element('div');
				div1 = element('div');
				t2 = text(/*title*/ ctx[3]);
				t3 = space();
				div2 = element('div');
				t4 = text(/*description*/ ctx[0]);
				t5 = space();
				div4 = element('div');
				if_block.c();
				attr_dev(div0, 'class', 'number svelte-1bejfuk');
				add_location(div0, file$a, 10, 2, 241);
				attr_dev(div1, 'class', 'title');
				add_location(div1, file$a, 12, 4, 304);
				attr_dev(div2, 'class', 'description svelte-1bejfuk');
				add_location(div2, file$a, 13, 4, 341);
				attr_dev(div3, 'class', 'details');
				add_location(div3, file$a, 11, 2, 278);
				attr_dev(div4, 'class', 'icon svelte-1bejfuk');
				add_location(div4, file$a, 17, 2, 409);
				attr_dev(div5, 'role', 'button');
				attr_dev(
					div5,
					'class',
					(div5_class_value =
						'' + (null_to_empty(/*visited*/ ctx[4] ? 'visited' : '') + ' svelte-1bejfuk')),
				);
				add_location(div5, file$a, 9, 0, 167);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div5, anchor);
				append_dev(div5, div0);
				append_dev(div0, t0);
				append_dev(div5, t1);
				append_dev(div5, div3);
				append_dev(div3, div1);
				append_dev(div1, t2);
				append_dev(div3, t3);
				append_dev(div3, div2);
				append_dev(div2, t4);
				append_dev(div5, t5);
				append_dev(div5, div4);
				if_blocks[current_block_type_index].m(div4, null);
				current = true;

				if (!mounted) {
					dispose = listen_dev(
						div5,
						'click',
						function () {
							if (is_function(/*onClick*/ ctx[2])) /*onClick*/ ctx[2].apply(this, arguments);
						},
						false,
						false,
						false,
					);

					mounted = true;
				}
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;
				if (!current || dirty & /*number*/ 2) set_data_dev(t0, /*number*/ ctx[1]);
				if (!current || dirty & /*title*/ 8) set_data_dev(t2, /*title*/ ctx[3]);
				if (!current || dirty & /*description*/ 1) set_data_dev(t4, /*description*/ ctx[0]);
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					group_outros();

					transition_out(if_blocks[previous_block_index], 1, 1, () => {
						if_blocks[previous_block_index] = null;
					});

					check_outros();
					if_block = if_blocks[current_block_type_index];

					if (!if_block) {
						if_block = if_blocks[current_block_type_index] =
							if_block_creators[current_block_type_index](ctx);
						if_block.c();
					}

					transition_in(if_block, 1);
					if_block.m(div4, null);
				}

				if (
					!current ||
					(dirty & /*visited*/ 16 &&
						div5_class_value !==
							(div5_class_value =
								'' + (null_to_empty(/*visited*/ ctx[4] ? 'visited' : '') + ' svelte-1bejfuk')))
				) {
					attr_dev(div5, 'class', div5_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div5);
				if_blocks[current_block_type_index].d();
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$a.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$a($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('DescriptiveNumberedButton', slots, []);
		let { description } = $$props;
		let { number } = $$props;
		let { onClick } = $$props;
		let { title } = $$props;
		let { visited } = $$props;
		const writable_props = ['description', 'number', 'onClick', 'title', 'visited'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<DescriptiveNumberedButton> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('description' in $$props) $$invalidate(0, (description = $$props.description));
			if ('number' in $$props) $$invalidate(1, (number = $$props.number));
			if ('onClick' in $$props) $$invalidate(2, (onClick = $$props.onClick));
			if ('title' in $$props) $$invalidate(3, (title = $$props.title));
			if ('visited' in $$props) $$invalidate(4, (visited = $$props.visited));
		};

		$$self.$capture_state = () => ({
			Icon,
			description,
			number,
			onClick,
			title,
			visited,
		});

		$$self.$inject_state = ($$props) => {
			if ('description' in $$props) $$invalidate(0, (description = $$props.description));
			if ('number' in $$props) $$invalidate(1, (number = $$props.number));
			if ('onClick' in $$props) $$invalidate(2, (onClick = $$props.onClick));
			if ('title' in $$props) $$invalidate(3, (title = $$props.title));
			if ('visited' in $$props) $$invalidate(4, (visited = $$props.visited));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [description, number, onClick, title, visited];
	}

	class DescriptiveNumberedButton extends SvelteComponentDev {
		constructor(options) {
			super(options);

			init(this, options, instance$a, create_fragment$a, safe_not_equal, {
				description: 0,
				number: 1,
				onClick: 2,
				title: 3,
				visited: 4,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'DescriptiveNumberedButton',
				options,
				id: create_fragment$a.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*description*/ ctx[0] === undefined && !('description' in props)) {
				console.warn("<DescriptiveNumberedButton> was created without expected prop 'description'");
			}

			if (/*number*/ ctx[1] === undefined && !('number' in props)) {
				console.warn("<DescriptiveNumberedButton> was created without expected prop 'number'");
			}

			if (/*onClick*/ ctx[2] === undefined && !('onClick' in props)) {
				console.warn("<DescriptiveNumberedButton> was created without expected prop 'onClick'");
			}

			if (/*title*/ ctx[3] === undefined && !('title' in props)) {
				console.warn("<DescriptiveNumberedButton> was created without expected prop 'title'");
			}

			if (/*visited*/ ctx[4] === undefined && !('visited' in props)) {
				console.warn("<DescriptiveNumberedButton> was created without expected prop 'visited'");
			}
		}

		get description() {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set description(value) {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get number() {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set number(value) {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get onClick() {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set onClick(value) {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get title() {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set title(value) {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get visited() {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set visited(value) {
			throw new Error(
				"<DescriptiveNumberedButton>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/Drawer.svelte generated by Svelte v3.48.0 */
	const file$9 = 'src/Drawer.svelte';

	// (5:0) {#if shown}
	function create_if_block$3(ctx) {
		let div0;
		let div0_intro;
		let div0_outro;
		let t;
		let div1;
		let div1_intro;
		let div1_outro;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[2].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

		const block = {
			c: function create() {
				div0 = element('div');
				t = space();
				div1 = element('div');
				if (default_slot) default_slot.c();
				attr_dev(div0, 'class', 'overlay svelte-d3k6tm');
				add_location(div0, file$9, 6, 2, 189);
				attr_dev(div1, 'class', 'drawer-container svelte-d3k6tm');
				add_location(div1, file$9, 13, 2, 304);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div0, anchor);
				insert_dev(target, t, anchor);
				insert_dev(target, div1, anchor);

				if (default_slot) {
					default_slot.m(div1, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(div0, 'click', /*click_handler*/ ctx[3], false, false, false);
					mounted = true;
				}
			},
			p: function update(ctx, dirty) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[1],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;

				add_render_callback(() => {
					if (div0_outro) div0_outro.end(1);
					div0_intro = create_in_transition(div0, fade, { duration: 100 });
					div0_intro.start();
				});

				transition_in(default_slot, local);

				add_render_callback(() => {
					if (div1_outro) div1_outro.end(1);
					div1_intro = create_in_transition(div1, fly, { x: 120 });
					div1_intro.start();
				});

				current = true;
			},
			o: function outro(local) {
				if (div0_intro) div0_intro.invalidate();
				div0_outro = create_out_transition(div0, fade, {});
				transition_out(default_slot, local);
				if (div1_intro) div1_intro.invalidate();
				div1_outro = create_out_transition(div1, fly, { x: 120 });
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div0);
				if (detaching && div0_outro) div0_outro.end();
				if (detaching) detach_dev(t);
				if (detaching) detach_dev(div1);
				if (default_slot) default_slot.d(detaching);
				if (detaching && div1_outro) div1_outro.end();
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$3.name,
			type: 'if',
			source: '(5:0) {#if shown}',
			ctx,
		});

		return block;
	}

	function create_fragment$9(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*shown*/ ctx[0] && create_if_block$3(ctx);

		const block = {
			c: function create() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (/*shown*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*shown*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$3(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$9.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$9($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Drawer', slots, ['default']);
		let { shown = false } = $$props;
		const writable_props = ['shown'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Drawer> was created with unknown prop '${key}'`);
		});

		const click_handler = () => $$invalidate(0, (shown = false));

		$$self.$$set = ($$props) => {
			if ('shown' in $$props) $$invalidate(0, (shown = $$props.shown));
			if ('$$scope' in $$props) $$invalidate(1, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ fly, fade, shown });

		$$self.$inject_state = ($$props) => {
			if ('shown' in $$props) $$invalidate(0, (shown = $$props.shown));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [shown, $$scope, slots, click_handler];
	}

	class Drawer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$9, create_fragment$9, safe_not_equal, { shown: 0 });

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Drawer',
				options,
				id: create_fragment$9.name,
			});
		}

		get shown() {
			throw new Error(
				"<Drawer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set shown(value) {
			throw new Error(
				"<Drawer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/AlertText.svelte generated by Svelte v3.48.0 */
	const file$8 = 'src/AlertText.svelte';

	function create_fragment$8(ctx) {
		let p;
		let icon;
		let t;
		let current;

		icon = new Icon({
			props: { name: 'questionCircle' },
			$$inline: true,
		});

		const default_slot_template = /*#slots*/ ctx[1].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

		const block = {
			c: function create() {
				p = element('p');
				create_component(icon.$$.fragment);
				t = space();
				if (default_slot) default_slot.c();
				attr_dev(p, 'class', 'svelte-23radz');
				add_location(p, file$8, 4, 0, 56);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, p, anchor);
				mount_component(icon, p, null);
				append_dev(p, t);

				if (default_slot) {
					default_slot.m(p, null);
				}

				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 1)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[0],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(icon.$$.fragment, local);
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(icon.$$.fragment, local);
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(p);
				destroy_component(icon);
				if (default_slot) default_slot.d(detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$8.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$8($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('AlertText', slots, ['default']);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<AlertText> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('$$scope' in $$props) $$invalidate(0, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ Icon });
		return [$$scope, slots];
	}

	class AlertText extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'AlertText',
				options,
				id: create_fragment$8.name,
			});
		}
	}

	/* src/FundingCycleInput.svelte generated by Svelte v3.48.0 */

	const file$7 = 'src/FundingCycleInput.svelte';

	function create_fragment$7(ctx) {
		let label;
		let small;
		let t1;
		let t2;
		let section;
		let input;
		let t3;
		let select;
		let option0;
		let option1;
		let option2;
		let option3;

		const block = {
			c: function create() {
				label = element('label');
				small = element('small');
				small.textContent = '*';
				t1 = text(' Funding cycle duration');
				t2 = space();
				section = element('section');
				input = element('input');
				t3 = space();
				select = element('select');
				option0 = element('option');
				option0.textContent = 'Days';
				option1 = element('option');
				option1.textContent = 'Hours';
				option2 = element('option');
				option2.textContent = 'Minutes';
				option3 = element('option');
				option3.textContent = 'Seconds';
				attr_dev(small, 'class', 'svelte-14pm148');
				add_location(small, file$7, 1, 2, 29);
				attr_dev(label, 'for', 'fundingCycle');
				attr_dev(label, 'class', 'svelte-14pm148');
				add_location(label, file$7, 0, 0, 0);
				attr_dev(input, 'id', 'fundingCycle');
				attr_dev(input, 'placeholder', '30');
				attr_dev(input, 'class', 'svelte-14pm148');
				add_location(input, file$7, 4, 2, 90);
				option0.__value = 'Days';
				option0.value = option0.__value;
				add_location(option0, file$7, 6, 4, 150);
				option1.__value = 'Hours';
				option1.value = option1.__value;
				add_location(option1, file$7, 7, 4, 176);
				option2.__value = 'Minutes';
				option2.value = option2.__value;
				add_location(option2, file$7, 8, 4, 203);
				option3.__value = 'Seconds';
				option3.value = option3.__value;
				add_location(option3, file$7, 9, 4, 232);
				attr_dev(select, 'class', 'svelte-14pm148');
				add_location(select, file$7, 5, 2, 137);
				attr_dev(section, 'class', 'svelte-14pm148');
				add_location(section, file$7, 3, 0, 78);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, label, anchor);
				append_dev(label, small);
				append_dev(label, t1);
				insert_dev(target, t2, anchor);
				insert_dev(target, section, anchor);
				append_dev(section, input);
				append_dev(section, t3);
				append_dev(section, select);
				append_dev(select, option0);
				append_dev(select, option1);
				append_dev(select, option2);
				append_dev(select, option3);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(label);
				if (detaching) detach_dev(t2);
				if (detaching) detach_dev(section);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$7.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$7($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FundingCycleInput', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<FundingCycleInput> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class FundingCycleInput extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'FundingCycleInput',
				options,
				id: create_fragment$7.name,
			});
		}
	}

	/* src/Toggle.svelte generated by Svelte v3.48.0 */

	const file$6 = 'src/Toggle.svelte';

	function create_fragment$6(ctx) {
		let div;
		let input;
		let label;
		let t1;
		let current;
		let mounted;
		let dispose;
		const default_slot_template = /*#slots*/ ctx[3].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[2], null);

		const block = {
			c: function create() {
				div = element('div');
				input = element('input');
				label = element('label');
				label.textContent = 'Toggle';
				t1 = space();
				if (default_slot) default_slot.c();
				attr_dev(input, 'type', 'checkbox');
				attr_dev(input, 'id', 'switch');
				input.checked = /*checked*/ ctx[0];
				attr_dev(input, 'class', 'svelte-fudium');
				add_location(input, file$6, 6, 2, 72);
				attr_dev(label, 'for', 'switch');
				attr_dev(label, 'class', 'svelte-fudium');
				add_location(label, file$6, 6, 68, 138);
				attr_dev(div, 'class', 'svelte-fudium');
				add_location(div, file$6, 5, 0, 64);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, input);
				append_dev(div, label);
				append_dev(div, t1);

				if (default_slot) {
					default_slot.m(div, null);
				}

				current = true;

				if (!mounted) {
					dispose = listen_dev(
						input,
						'click',
						function () {
							if (is_function(/*onClick*/ ctx[1])) /*onClick*/ ctx[1].apply(this, arguments);
						},
						false,
						false,
						false,
					);

					mounted = true;
				}
			},
			p: function update(new_ctx, [dirty]) {
				ctx = new_ctx;

				if (!current || dirty & /*checked*/ 1) {
					prop_dev(input, 'checked', /*checked*/ ctx[0]);
				}

				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 4)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[2],
							!current
								? get_all_dirty_from_scope(/*$$scope*/ ctx[2])
								: get_slot_changes(default_slot_template, /*$$scope*/ ctx[2], dirty, null),
							null,
						);
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(default_slot, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(default_slot, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				if (default_slot) default_slot.d(detaching);
				mounted = false;
				dispose();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$6.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$6($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('Toggle', slots, ['default']);
		let { checked } = $$props;
		let { onClick } = $$props;
		const writable_props = ['checked', 'onClick'];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<Toggle> was created with unknown prop '${key}'`);
		});

		$$self.$$set = ($$props) => {
			if ('checked' in $$props) $$invalidate(0, (checked = $$props.checked));
			if ('onClick' in $$props) $$invalidate(1, (onClick = $$props.onClick));
			if ('$$scope' in $$props) $$invalidate(2, ($$scope = $$props.$$scope));
		};

		$$self.$capture_state = () => ({ checked, onClick });

		$$self.$inject_state = ($$props) => {
			if ('checked' in $$props) $$invalidate(0, (checked = $$props.checked));
			if ('onClick' in $$props) $$invalidate(1, (onClick = $$props.onClick));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [checked, onClick, $$scope, slots];
	}

	class Toggle extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$6, create_fragment$6, safe_not_equal, {
				checked: 0,
				onClick: 1,
			});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'Toggle',
				options,
				id: create_fragment$6.name,
			});

			const { ctx } = this.$$;
			const props = options.props || {};

			if (/*checked*/ ctx[0] === undefined && !('checked' in props)) {
				console.warn("<Toggle> was created without expected prop 'checked'");
			}

			if (/*onClick*/ ctx[1] === undefined && !('onClick' in props)) {
				console.warn("<Toggle> was created without expected prop 'onClick'");
			}
		}

		get checked() {
			throw new Error(
				"<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set checked(value) {
			throw new Error(
				"<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		get onClick() {
			throw new Error(
				"<Toggle>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}

		set onClick(value) {
			throw new Error(
				"<Toggle>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'",
			);
		}
	}

	/* src/FundingDrawer.svelte generated by Svelte v3.48.0 */
	const file$5 = 'src/FundingDrawer.svelte';

	// (15:2) <Toggle checked={fundingCycles} onClick={toggleFundingCycles}     >
	function create_default_slot_5$1(ctx) {
		let h3;

		const block = {
			c: function create() {
				h3 = element('h3');
				h3.textContent = 'Funding cycles';
				attr_dev(h3, 'class', 'svelte-1rk6uac');
				add_location(h3, file$5, 15, 5, 447);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h3, anchor);
			},
			p: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(h3);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_5$1.name,
			type: 'slot',
			source: '(15:2) <Toggle checked={fundingCycles} onClick={toggleFundingCycles}     >',
			ctx,
		});

		return block;
	}

	// (33:2) {#if fundingCycles}
	function create_if_block$2(ctx) {
		let input;
		let current;
		input = new FundingCycleInput({ $$inline: true });

		const block = {
			c: function create() {
				create_component(input.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(input, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(input.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(input.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(input, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$2.name,
			type: 'if',
			source: '(33:2) {#if fundingCycles}',
			ctx,
		});

		return block;
	}

	// (14:0) <HeavyBorderBox>
	function create_default_slot_4$1(ctx) {
		let toggle;
		let t0;
		let p;
		let t2;
		let ol;
		let li0;
		let b0;
		let t4;
		let t5;
		let li1;
		let t6;
		let b1;
		let t8;
		let t9;
		let li2;
		let t10;
		let a;
		let t12;
		let t13;
		let if_block_anchor;
		let current;

		toggle = new Toggle({
			props: {
				checked: /*fundingCycles*/ ctx[0],
				onClick: /*toggleFundingCycles*/ ctx[1],
				$$slots: { default: [create_default_slot_5$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		let if_block = /*fundingCycles*/ ctx[0] && create_if_block$2(ctx);

		const block = {
			c: function create() {
				create_component(toggle.$$.fragment);
				t0 = space();
				p = element('p');
				p.textContent = 'Set the length of your funding cycles, which can enable:';
				t2 = space();
				ol = element('ol');
				li0 = element('li');
				b0 = element('b');
				b0.textContent = 'Recurring funding cycles';
				t4 = text(
					" (for example, distribute $30,000 from your\n      project's treasury every 14 days).",
				);
				t5 = space();
				li1 = element('li');
				t6 = text('A ');
				b1 = element('b');
				b1.textContent = 'discount rate';
				t8 = text(
					" to automatically reduce the issuance rate of your project's\n      token (tokens/ETH) each new funding cycle.",
				);
				t9 = space();
				li2 = element('li');
				t10 = text(
					'Restrict how the owner can reconfigure upcoming funding cycles to mitigate\n      abuse of power. ',
				);
				a = element('a');
				a.textContent = 'Learn more';
				t12 = text('.');
				t13 = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				add_location(p, file$5, 17, 2, 485);
				add_location(b0, file$5, 20, 6, 571);
				add_location(li0, file$5, 19, 4, 560);
				add_location(b1, file$5, 24, 8, 714);
				add_location(li1, file$5, 23, 4, 701);
				attr_dev(a, 'href', '/');
				add_location(a, file$5, 29, 22, 966);
				add_location(li2, file$5, 27, 4, 858);
				add_location(ol, file$5, 18, 2, 551);
			},
			m: function mount(target, anchor) {
				mount_component(toggle, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, p, anchor);
				insert_dev(target, t2, anchor);
				insert_dev(target, ol, anchor);
				append_dev(ol, li0);
				append_dev(li0, b0);
				append_dev(li0, t4);
				append_dev(ol, t5);
				append_dev(ol, li1);
				append_dev(li1, t6);
				append_dev(li1, b1);
				append_dev(li1, t8);
				append_dev(ol, t9);
				append_dev(ol, li2);
				append_dev(li2, t10);
				append_dev(li2, a);
				append_dev(li2, t12);
				insert_dev(target, t13, anchor);
				if (if_block) if_block.m(target, anchor);
				insert_dev(target, if_block_anchor, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const toggle_changes = {};
				if (dirty & /*fundingCycles*/ 1) toggle_changes.checked = /*fundingCycles*/ ctx[0];

				if (dirty & /*$$scope*/ 4) {
					toggle_changes.$$scope = { dirty, ctx };
				}

				toggle.$set(toggle_changes);

				if (/*fundingCycles*/ ctx[0]) {
					if (if_block) {
						if (dirty & /*fundingCycles*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$2(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(toggle.$$.fragment, local);
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(toggle.$$.fragment, local);
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(toggle, detaching);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(p);
				if (detaching) detach_dev(t2);
				if (detaching) detach_dev(ol);
				if (detaching) detach_dev(t13);
				if (if_block) if_block.d(detaching);
				if (detaching) detach_dev(if_block_anchor);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_4$1.name,
			type: 'slot',
			source: '(14:0) <HeavyBorderBox>',
			ctx,
		});

		return block;
	}

	// (64:2) <AlertText     >
	function create_default_slot_3$1(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text(
					'With a distribution limit of Zero, no funds can be distributed by the\n    project. All funds belong to token holders as overflow.',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_3$1.name,
			type: 'slot',
			source: '(64:2) <AlertText     >',
			ctx,
		});

		return block;
	}

	// (37:0) <HeavyBorderBox>
	function create_default_slot_2$2(ctx) {
		let h3;
		let t1;
		let p0;
		let t3;
		let p1;
		let t4;
		let b0;
		let t6;
		let a0;
		let t8;
		let t9;
		let p2;
		let t10;
		let b1;
		let t12;
		let a1;
		let t14;
		let t15;
		let label;
		let t17;
		let select;
		let option0;
		let option1;
		let t20;
		let option2;
		let t22;
		let alerttext;
		let current;

		alerttext = new AlertText({
			props: {
				$$slots: { default: [create_default_slot_3$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				h3 = element('h3');
				h3.textContent = 'Distribution limit';
				t1 = space();
				p0 = element('p');
				p0.textContent =
					"Set the amount of funds you'd like to distribute from your treasury each\n    funding cycle.";
				t3 = space();
				p1 = element('p');
				t4 = text(
					'Any treasury funds within the distribution limit can be paid out to\n    destinations that you can define as ',
				);
				b0 = element('b');
				b0.textContent = 'splits';
				t6 = text('.\n    ');
				a0 = element('a');
				a0.textContent = 'Learn more';
				t8 = text(' about payout splits.');
				t9 = space();
				p2 = element('p');
				t10 = text('Any treasury funds in excess of the distribution limit is called ');
				b1 = element('b');
				b1.textContent = 'overflow.';
				t12 = text(
					"\n    Overflow can be claimed by your project's token holders by redeeming their tokens.\n    ",
				);
				a1 = element('a');
				a1.textContent = 'Learn more';
				t14 = text(' about overflow.');
				t15 = space();
				label = element('label');
				label.textContent = 'Distribution limit';
				t17 = space();
				select = element('select');
				option0 = element('option');
				option0.textContent = 'Zero, no funds can be distributed';
				option1 = element('option');
				option1.textContent = 'No limit (infinite)';
				t20 = text('1\n    ');
				option2 = element('option');
				option2.textContent = 'Specific target';
				t22 = space();
				create_component(alerttext.$$.fragment);
				attr_dev(h3, 'class', 'svelte-1rk6uac');
				add_location(h3, file$5, 37, 2, 1093);
				add_location(p0, file$5, 38, 2, 1123);
				add_location(b0, file$5, 45, 40, 1349);
				attr_dev(a0, 'href', '/');
				add_location(a0, file$5, 46, 4, 1368);
				add_location(p1, file$5, 43, 2, 1233);
				add_location(b1, file$5, 49, 69, 1498);
				attr_dev(a1, 'href', '/');
				add_location(a1, file$5, 53, 4, 1618);
				add_location(p2, file$5, 48, 2, 1425);
				attr_dev(label, 'for', 'distributionLimit');
				attr_dev(label, 'class', 'svelte-1rk6uac');
				add_location(label, file$5, 55, 2, 1670);
				option0.__value = 'Zero, no funds can be distributed';
				option0.value = option0.__value;
				add_location(option0, file$5, 57, 4, 1743);
				option1.__value = 'No limit (infinite)';
				option1.value = option1.__value;
				add_location(option1, file$5, 59, 4, 1845);
				option2.__value = 'Specific target';
				option2.value = option2.__value;
				add_location(option2, file$5, 61, 4, 1959);
				attr_dev(select, 'class', 'svelte-1rk6uac');
				add_location(select, file$5, 56, 2, 1730);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h3, anchor);
				insert_dev(target, t1, anchor);
				insert_dev(target, p0, anchor);
				insert_dev(target, t3, anchor);
				insert_dev(target, p1, anchor);
				append_dev(p1, t4);
				append_dev(p1, b0);
				append_dev(p1, t6);
				append_dev(p1, a0);
				append_dev(p1, t8);
				insert_dev(target, t9, anchor);
				insert_dev(target, p2, anchor);
				append_dev(p2, t10);
				append_dev(p2, b1);
				append_dev(p2, t12);
				append_dev(p2, a1);
				append_dev(p2, t14);
				insert_dev(target, t15, anchor);
				insert_dev(target, label, anchor);
				insert_dev(target, t17, anchor);
				insert_dev(target, select, anchor);
				append_dev(select, option0);
				append_dev(select, option1);
				append_dev(select, t20);
				append_dev(select, option2);
				insert_dev(target, t22, anchor);
				mount_component(alerttext, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const alerttext_changes = {};

				if (dirty & /*$$scope*/ 4) {
					alerttext_changes.$$scope = { dirty, ctx };
				}

				alerttext.$set(alerttext_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(alerttext.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(alerttext.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(h3);
				if (detaching) detach_dev(t1);
				if (detaching) detach_dev(p0);
				if (detaching) detach_dev(t3);
				if (detaching) detach_dev(p1);
				if (detaching) detach_dev(t9);
				if (detaching) detach_dev(p2);
				if (detaching) detach_dev(t15);
				if (detaching) detach_dev(label);
				if (detaching) detach_dev(t17);
				if (detaching) detach_dev(select);
				if (detaching) detach_dev(t22);
				destroy_component(alerttext, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_2$2.name,
			type: 'slot',
			source: '(37:0) <HeavyBorderBox>',
			ctx,
		});

		return block;
	}

	// (71:2) <AlertText     >
	function create_default_slot_1$2(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text("Payout splits can't be scheduled when the distribution limit is Zero.");
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_1$2.name,
			type: 'slot',
			source: '(71:2) <AlertText     >',
			ctx,
		});

		return block;
	}

	// (69:0) <HeavyBorderBox>
	function create_default_slot$3(ctx) {
		let h3;
		let t1;
		let alerttext;
		let current;

		alerttext = new AlertText({
			props: {
				$$slots: { default: [create_default_slot_1$2] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				h3 = element('h3');
				h3.textContent = 'Payout splits';
				t1 = space();
				create_component(alerttext.$$.fragment);
				attr_dev(h3, 'class', 'svelte-1rk6uac');
				add_location(h3, file$5, 69, 2, 2204);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h3, anchor);
				insert_dev(target, t1, anchor);
				mount_component(alerttext, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const alerttext_changes = {};

				if (dirty & /*$$scope*/ 4) {
					alerttext_changes.$$scope = { dirty, ctx };
				}

				alerttext.$set(alerttext_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(alerttext.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(alerttext.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(h3);
				if (detaching) detach_dev(t1);
				destroy_component(alerttext, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$3.name,
			type: 'slot',
			source: '(69:0) <HeavyBorderBox>',
			ctx,
		});

		return block;
	}

	function create_fragment$5(ctx) {
		let h1;
		let t1;
		let heavyborderbox0;
		let t2;
		let heavyborderbox1;
		let t3;
		let heavyborderbox2;
		let current;

		heavyborderbox0 = new HeavyBorderBox({
			props: {
				$$slots: { default: [create_default_slot_4$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		heavyborderbox1 = new HeavyBorderBox({
			props: {
				$$slots: { default: [create_default_slot_2$2] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		heavyborderbox2 = new HeavyBorderBox({
			props: {
				$$slots: { default: [create_default_slot$3] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				h1 = element('h1');
				h1.textContent = 'Funding';
				t1 = space();
				create_component(heavyborderbox0.$$.fragment);
				t2 = space();
				create_component(heavyborderbox1.$$.fragment);
				t3 = space();
				create_component(heavyborderbox2.$$.fragment);
				attr_dev(h1, 'class', 'svelte-1rk6uac');
				add_location(h1, file$5, 12, 0, 344);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
				insert_dev(target, t1, anchor);
				mount_component(heavyborderbox0, target, anchor);
				insert_dev(target, t2, anchor);
				mount_component(heavyborderbox1, target, anchor);
				insert_dev(target, t3, anchor);
				mount_component(heavyborderbox2, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const heavyborderbox0_changes = {};

				if (dirty & /*$$scope, fundingCycles*/ 5) {
					heavyborderbox0_changes.$$scope = { dirty, ctx };
				}

				heavyborderbox0.$set(heavyborderbox0_changes);
				const heavyborderbox1_changes = {};

				if (dirty & /*$$scope*/ 4) {
					heavyborderbox1_changes.$$scope = { dirty, ctx };
				}

				heavyborderbox1.$set(heavyborderbox1_changes);
				const heavyborderbox2_changes = {};

				if (dirty & /*$$scope*/ 4) {
					heavyborderbox2_changes.$$scope = { dirty, ctx };
				}

				heavyborderbox2.$set(heavyborderbox2_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(heavyborderbox0.$$.fragment, local);
				transition_in(heavyborderbox1.$$.fragment, local);
				transition_in(heavyborderbox2.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(heavyborderbox0.$$.fragment, local);
				transition_out(heavyborderbox1.$$.fragment, local);
				transition_out(heavyborderbox2.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(h1);
				if (detaching) detach_dev(t1);
				destroy_component(heavyborderbox0, detaching);
				if (detaching) detach_dev(t2);
				destroy_component(heavyborderbox1, detaching);
				if (detaching) detach_dev(t3);
				destroy_component(heavyborderbox2, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$5.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$5($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FundingDrawer', slots, []);
		let fundingCycles = false;

		function toggleFundingCycles(e) {
			$$invalidate(0, (fundingCycles = !fundingCycles));
		}

		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<FundingDrawer> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			AlertText,
			HeavyBorderBox,
			Input: FundingCycleInput,
			Toggle,
			fundingCycles,
			toggleFundingCycles,
		});

		$$self.$inject_state = ($$props) => {
			if ('fundingCycles' in $$props) $$invalidate(0, (fundingCycles = $$props.fundingCycles));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [fundingCycles, toggleFundingCycles];
	}

	class FundingDrawer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'FundingDrawer',
				options,
				id: create_fragment$5.name,
			});
		}
	}

	/* src/RulesDrawer.svelte generated by Svelte v3.48.0 */

	const file$4 = 'src/RulesDrawer.svelte';

	function create_fragment$4(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element('h1');
				h1.textContent = 'Rules';
				add_location(h1, file$4, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(h1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$4.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$4($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('RulesDrawer', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<RulesDrawer> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class RulesDrawer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'RulesDrawer',
				options,
				id: create_fragment$4.name,
			});
		}
	}

	/* src/TokenDrawer.svelte generated by Svelte v3.48.0 */

	const file$3 = 'src/TokenDrawer.svelte';

	function create_fragment$3(ctx) {
		let h1;

		const block = {
			c: function create() {
				h1 = element('h1');
				h1.textContent = 'Token';
				add_location(h1, file$3, 0, 0, 0);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h1, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d: function destroy(detaching) {
				if (detaching) detach_dev(h1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$3.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$3($$self, $$props) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('TokenDrawer', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<TokenDrawer> was created with unknown prop '${key}'`);
		});

		return [];
	}

	class TokenDrawer extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'TokenDrawer',
				options,
				id: create_fragment$3.name,
			});
		}
	}

	/* src/FundingCycle.svelte generated by Svelte v3.48.0 */

	const { Object: Object_1 } = globals;
	const file$2 = 'src/FundingCycle.svelte';

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[7] = list[i];
		child_ctx[9] = i;
		return child_ctx;
	}

	// (38:2) {#each buttons as button, number}
	function create_each_block(ctx) {
		let descriptivenumberedbutton;
		let current;

		function func() {
			return /*func*/ ctx[5](/*button*/ ctx[7]);
		}

		const descriptivenumberedbutton_spread_levels = [
			/*button*/ ctx[7],
			{ number: /*number*/ ctx[9] + 1 },
			{ onClick: func },
			{
				visited: /*$visited*/ ctx[2][/*button*/ ctx[7].title],
			},
		];

		let descriptivenumberedbutton_props = {};

		for (let i = 0; i < descriptivenumberedbutton_spread_levels.length; i += 1) {
			descriptivenumberedbutton_props = assign(
				descriptivenumberedbutton_props,
				descriptivenumberedbutton_spread_levels[i],
			);
		}

		descriptivenumberedbutton = new DescriptiveNumberedButton({
			props: descriptivenumberedbutton_props,
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(descriptivenumberedbutton.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(descriptivenumberedbutton, target, anchor);
				current = true;
			},
			p: function update(new_ctx, dirty) {
				ctx = new_ctx;

				const descriptivenumberedbutton_changes =
					dirty & /*buttons, onClick, $visited*/ 28
						? get_spread_update(descriptivenumberedbutton_spread_levels, [
								dirty & /*buttons*/ 8 && get_spread_object(/*button*/ ctx[7]),
								descriptivenumberedbutton_spread_levels[1],
								dirty & /*onClick, buttons*/ 24 && { onClick: func },
								dirty & /*$visited, buttons*/ 12 && {
									visited: /*$visited*/ ctx[2][/*button*/ ctx[7].title],
								},
						  ])
						: {};

				descriptivenumberedbutton.$set(descriptivenumberedbutton_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(descriptivenumberedbutton.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(descriptivenumberedbutton.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(descriptivenumberedbutton, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_each_block.name,
			type: 'each',
			source: '(38:2) {#each buttons as button, number}',
			ctx,
		});

		return block;
	}

	// (54:34)
	function create_if_block_2(ctx) {
		let rulesdrawer;
		let current;
		rulesdrawer = new RulesDrawer({ $$inline: true });

		const block = {
			c: function create() {
				create_component(rulesdrawer.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(rulesdrawer, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(rulesdrawer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(rulesdrawer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(rulesdrawer, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_2.name,
			type: 'if',
			source: '(54:34) ',
			ctx,
		});

		return block;
	}

	// (52:34)
	function create_if_block_1$1(ctx) {
		let tokendrawer;
		let current;
		tokendrawer = new TokenDrawer({ $$inline: true });

		const block = {
			c: function create() {
				create_component(tokendrawer.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(tokendrawer, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tokendrawer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(tokendrawer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(tokendrawer, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1$1.name,
			type: 'if',
			source: '(52:34) ',
			ctx,
		});

		return block;
	}

	// (50:4) {#if current === "Funding"}
	function create_if_block$1(ctx) {
		let fundingdrawer;
		let current;
		fundingdrawer = new FundingDrawer({ $$inline: true });

		const block = {
			c: function create() {
				create_component(fundingdrawer.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(fundingdrawer, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(fundingdrawer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(fundingdrawer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(fundingdrawer, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block$1.name,
			type: 'if',
			source: '(50:4) {#if current === \\"Funding\\"}',
			ctx,
		});

		return block;
	}

	// (48:0) <Drawer bind:shown={drawerOpen}>
	function create_default_slot$2(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*current*/ ctx[1] === 'Funding') return 0;
			if (/*current*/ ctx[1] === 'Token') return 1;
			if (/*current*/ ctx[1] === 'Rules') return 2;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] =
				if_block_creators[current_block_type_index](ctx);
		}

		const block = {
			c: function create() {
				div = element('div');
				if (if_block) if_block.c();
				attr_dev(div, 'class', 'content svelte-6bctg7');
				add_location(div, file$2, 48, 2, 1545);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div, null);
				}

				current = true;
			},
			p: function update(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index !== previous_block_index) {
					if (if_block) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];

						if (!if_block) {
							if_block = if_blocks[current_block_type_index] =
								if_block_creators[current_block_type_index](ctx);
							if_block.c();
						}

						transition_in(if_block, 1);
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o: function outro(local) {
				transition_out(if_block);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$2.name,
			type: 'slot',
			source: '(48:0) <Drawer bind:shown={drawerOpen}>',
			ctx,
		});

		return block;
	}

	function create_fragment$2(ctx) {
		let infobox;
		let t0;
		let section;
		let t1;
		let drawer;
		let updating_shown;
		let current;

		infobox = new InfoBox({
			props: {
				info: `Funding Cycle #1 will start immediately after you deploy your project. Once deployed, <b>Funding Cycle #1 can't be reconfigured.</b>
<br><br>
You can reconfigure your project's funding cycles later on, and changes will take effect in the next funding cycle (Funding Cycle #2).`,
			},
			$$inline: true,
		});

		let each_value = /*buttons*/ ctx[3];
		validate_each_argument(each_value);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out = (i) =>
			transition_out(each_blocks[i], 1, 1, () => {
				each_blocks[i] = null;
			});

		function drawer_shown_binding(value) {
			/*drawer_shown_binding*/ ctx[6](value);
		}

		let drawer_props = {
			$$slots: { default: [create_default_slot$2] },
			$$scope: { ctx },
		};

		if (/*drawerOpen*/ ctx[0] !== void 0) {
			drawer_props.shown = /*drawerOpen*/ ctx[0];
		}

		drawer = new Drawer({ props: drawer_props, $$inline: true });
		binding_callbacks.push(() => bind(drawer, 'shown', drawer_shown_binding));

		const block = {
			c: function create() {
				create_component(infobox.$$.fragment);
				t0 = space();
				section = element('section');

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				t1 = space();
				create_component(drawer.$$.fragment);
				attr_dev(section, 'class', 'buttons svelte-6bctg7');
				add_location(section, file$2, 36, 0, 1261);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				mount_component(infobox, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, section, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].m(section, null);
				}

				insert_dev(target, t1, anchor);
				mount_component(drawer, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				if (dirty & /*buttons, onClick, $visited*/ 28) {
					each_value = /*buttons*/ ctx[3];
					validate_each_argument(each_value);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(section, null);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}

				const drawer_changes = {};

				if (dirty & /*$$scope, current*/ 1026) {
					drawer_changes.$$scope = { dirty, ctx };
				}

				if (!updating_shown && dirty & /*drawerOpen*/ 1) {
					updating_shown = true;
					drawer_changes.shown = /*drawerOpen*/ ctx[0];
					add_flush_callback(() => (updating_shown = false));
				}

				drawer.$set(drawer_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(infobox.$$.fragment, local);

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(drawer.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(infobox.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(drawer.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(infobox, detaching);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(section);
				destroy_each(each_blocks, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(drawer, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$2.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance$2($$self, $$props, $$invalidate) {
		let $visited;
		validate_store(visitedFundingDrawers, 'visited');
		component_subscribe($$self, visitedFundingDrawers, ($$value) =>
			$$invalidate(2, ($visited = $$value)),
		);
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('FundingCycle', slots, []);
		let drawerOpen = false;
		let current = '';

		const buttons = [
			{
				title: 'Funding',
				description: 'Configure how your project will collect and spend funds',
			},
			{
				title: 'Token',
				description: "Configure the dynamics of your project's token.",
			},
			{
				title: 'Rules',
				description: 'Configure restrictions for your funding cycles.',
			},
		];

		function onClick(button) {
			$$invalidate(0, (drawerOpen = true));
			$$invalidate(1, (current = button));
			visitedFundingDrawers.update((state) =>
				Object.assign(Object.assign({}, state), { [button]: true }),
			);
		}

		const writable_props = [];

		Object_1.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<FundingCycle> was created with unknown prop '${key}'`);
		});

		const func = (button) => onClick(button.title);

		function drawer_shown_binding(value) {
			drawerOpen = value;
			$$invalidate(0, drawerOpen);
		}

		$$self.$capture_state = () => ({
			visited: visitedFundingDrawers,
			DescriptiveNumberedButton,
			Drawer,
			FundingDrawer,
			InfoBox,
			RulesDrawer,
			TokenDrawer,
			drawerOpen,
			current,
			buttons,
			onClick,
			$visited,
		});

		$$self.$inject_state = ($$props) => {
			if ('drawerOpen' in $$props) $$invalidate(0, (drawerOpen = $$props.drawerOpen));
			if ('current' in $$props) $$invalidate(1, (current = $$props.current));
		};

		if ($$props && '$$inject' in $$props) {
			$$self.$inject_state($$props.$$inject);
		}

		return [drawerOpen, current, $visited, buttons, onClick, func, drawer_shown_binding];
	}

	class FundingCycle extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'FundingCycle',
				options,
				id: create_fragment$2.name,
			});
		}
	}

	/* src/CreateProject.svelte generated by Svelte v3.48.0 */

	const { console: console_1 } = globals;
	const file$1 = 'src/CreateProject.svelte';

	// (16:6) <Tab id="details">
	function create_default_slot_9(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('1. Project details');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_9.name,
			type: 'slot',
			source: '(16:6) <Tab id=\\"details\\">',
			ctx,
		});

		return block;
	}

	// (17:6) <Tab id="funding">
	function create_default_slot_8(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('2. Funding cycle');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_8.name,
			type: 'slot',
			source: '(17:6) <Tab id=\\"funding\\">',
			ctx,
		});

		return block;
	}

	// (18:6) <Tab id="review">
	function create_default_slot_7(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('3. Review and deploy');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_7.name,
			type: 'slot',
			source: '(18:6) <Tab id=\\"review\\">',
			ctx,
		});

		return block;
	}

	// (15:4) <TabList>
	function create_default_slot_6(ctx) {
		let tab0;
		let t0;
		let tab1;
		let t1;
		let tab2;
		let current;

		tab0 = new Tab({
			props: {
				id: 'details',
				$$slots: { default: [create_default_slot_9] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		tab1 = new Tab({
			props: {
				id: 'funding',
				$$slots: { default: [create_default_slot_8] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		tab2 = new Tab({
			props: {
				id: 'review',
				$$slots: { default: [create_default_slot_7] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(tab0.$$.fragment);
				t0 = space();
				create_component(tab1.$$.fragment);
				t1 = space();
				create_component(tab2.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(tab0, target, anchor);
				insert_dev(target, t0, anchor);
				mount_component(tab1, target, anchor);
				insert_dev(target, t1, anchor);
				mount_component(tab2, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const tab0_changes = {};

				if (dirty & /*$$scope*/ 8) {
					tab0_changes.$$scope = { dirty, ctx };
				}

				tab0.$set(tab0_changes);
				const tab1_changes = {};

				if (dirty & /*$$scope*/ 8) {
					tab1_changes.$$scope = { dirty, ctx };
				}

				tab1.$set(tab1_changes);
				const tab2_changes = {};

				if (dirty & /*$$scope*/ 8) {
					tab2_changes.$$scope = { dirty, ctx };
				}

				tab2.$set(tab2_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tab0.$$.fragment, local);
				transition_in(tab1.$$.fragment, local);
				transition_in(tab2.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(tab0.$$.fragment, local);
				transition_out(tab1.$$.fragment, local);
				transition_out(tab2.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(tab0, detaching);
				if (detaching) detach_dev(t0);
				destroy_component(tab1, detaching);
				if (detaching) detach_dev(t1);
				destroy_component(tab2, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_6.name,
			type: 'slot',
			source: '(15:4) <TabList>',
			ctx,
		});

		return block;
	}

	// (24:10) <Button onClick={() => onClick("funding")}>
	function create_default_slot_5(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('Next: Funding cycle');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_5.name,
			type: 'slot',
			source: '(24:10) <Button onClick={() => onClick(\\"funding\\")}>',
			ctx,
		});

		return block;
	}

	// (22:8) <TabPanel>
	function create_default_slot_4(ctx) {
		let projectdetails;
		let t;
		let button;
		let current;
		projectdetails = new ProjectDetails({ $$inline: true });

		button = new Button({
			props: {
				onClick: /*func*/ ctx[1],
				$$slots: { default: [create_default_slot_5] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(projectdetails.$$.fragment);
				t = space();
				create_component(button.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(projectdetails, target, anchor);
				insert_dev(target, t, anchor);
				mount_component(button, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 8) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(projectdetails.$$.fragment, local);
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(projectdetails.$$.fragment, local);
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(projectdetails, detaching);
				if (detaching) detach_dev(t);
				destroy_component(button, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_4.name,
			type: 'slot',
			source: '(22:8) <TabPanel>',
			ctx,
		});

		return block;
	}

	// (29:10) <Button onClick={() => onClick("review")}             >
	function create_default_slot_3(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('Next: Review and deploy');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_3.name,
			type: 'slot',
			source: '(29:10) <Button onClick={() => onClick(\\"review\\")}             >',
			ctx,
		});

		return block;
	}

	// (27:8) <TabPanel>
	function create_default_slot_2$1(ctx) {
		let fundingcycle;
		let t;
		let button;
		let current;
		fundingcycle = new FundingCycle({ $$inline: true });

		button = new Button({
			props: {
				onClick: /*func_1*/ ctx[2],
				$$slots: { default: [create_default_slot_3] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(fundingcycle.$$.fragment);
				t = space();
				create_component(button.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(fundingcycle, target, anchor);
				insert_dev(target, t, anchor);
				mount_component(button, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 8) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(fundingcycle.$$.fragment, local);
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(fundingcycle.$$.fragment, local);
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(fundingcycle, detaching);
				if (detaching) detach_dev(t);
				destroy_component(button, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_2$1.name,
			type: 'slot',
			source: '(27:8) <TabPanel>',
			ctx,
		});

		return block;
	}

	// (35:8) {#if $isReviewPanel}
	function create_if_block_1(ctx) {
		let h2;

		const block = {
			c: function create() {
				h2 = element('h2');
				h2.textContent = 'Review project configuration';
				add_location(h2, file$1, 35, 10, 1125);
			},
			m: function mount(target, anchor) {
				insert_dev(target, h2, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(h2);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block_1.name,
			type: 'if',
			source: '(35:8) {#if $isReviewPanel}',
			ctx,
		});

		return block;
	}

	// (39:8) {#if $isReviewPanel}
	function create_if_block(ctx) {
		let button;
		let current;

		button = new Button({
			props: {
				onClick: console.log,
				$$slots: { default: [create_default_slot_1$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(button.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(button, target, anchor);
				current = true;
			},
			p: function update(ctx, dirty) {
				const button_changes = {};

				if (dirty & /*$$scope*/ 8) {
					button_changes.$$scope = { dirty, ctx };
				}

				button.$set(button_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(button.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(button.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(button, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_if_block.name,
			type: 'if',
			source: '(39:8) {#if $isReviewPanel}',
			ctx,
		});

		return block;
	}

	// (40:10) <Button onClick={console.log}>
	function create_default_slot_1$1(ctx) {
		let t;

		const block = {
			c: function create() {
				t = text('Connect wallet to deploy');
			},
			m: function mount(target, anchor) {
				insert_dev(target, t, anchor);
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(t);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_1$1.name,
			type: 'slot',
			source: '(40:10) <Button onClick={console.log}>',
			ctx,
		});

		return block;
	}

	// (14:2) <Tabs>
	function create_default_slot$1(ctx) {
		let tablist;
		let t0;
		let div;
		let section0;
		let tabpanel0;
		let t1;
		let tabpanel1;
		let section0_class_value;
		let t2;
		let section1;
		let t3;
		let preview;
		let t4;
		let section1_class_value;
		let current;

		tablist = new TabList({
			props: {
				$$slots: { default: [create_default_slot_6] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		tabpanel0 = new TabPanel({
			props: {
				$$slots: { default: [create_default_slot_4] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		tabpanel1 = new TabPanel({
			props: {
				$$slots: { default: [create_default_slot_2$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		let if_block0 = /*$isReviewPanel*/ ctx[0] && create_if_block_1(ctx);
		preview = new Main({ $$inline: true });
		let if_block1 = /*$isReviewPanel*/ ctx[0] && create_if_block(ctx);

		const block = {
			c: function create() {
				create_component(tablist.$$.fragment);
				t0 = space();
				div = element('div');
				section0 = element('section');
				create_component(tabpanel0.$$.fragment);
				t1 = space();
				create_component(tabpanel1.$$.fragment);
				t2 = space();
				section1 = element('section');
				if (if_block0) if_block0.c();
				t3 = space();
				create_component(preview.$$.fragment);
				t4 = space();
				if (if_block1) if_block1.c();
				attr_dev(
					section0,
					'class',
					(section0_class_value =
						'' + (null_to_empty(/*$isReviewPanel*/ ctx[0] && 'collapse') + ' svelte-7hm1d7')),
				);
				add_location(section0, file$1, 20, 6, 637);
				attr_dev(
					section1,
					'class',
					(section1_class_value =
						'' + (null_to_empty(/*$isReviewPanel*/ ctx[0] && 'full') + ' svelte-7hm1d7')),
				);
				add_location(section1, file$1, 33, 6, 1043);
				attr_dev(div, 'class', 'row svelte-7hm1d7');
				add_location(div, file$1, 19, 4, 613);
			},
			m: function mount(target, anchor) {
				mount_component(tablist, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, div, anchor);
				append_dev(div, section0);
				mount_component(tabpanel0, section0, null);
				append_dev(section0, t1);
				mount_component(tabpanel1, section0, null);
				append_dev(div, t2);
				append_dev(div, section1);
				if (if_block0) if_block0.m(section1, null);
				append_dev(section1, t3);
				mount_component(preview, section1, null);
				append_dev(section1, t4);
				if (if_block1) if_block1.m(section1, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const tablist_changes = {};

				if (dirty & /*$$scope*/ 8) {
					tablist_changes.$$scope = { dirty, ctx };
				}

				tablist.$set(tablist_changes);
				const tabpanel0_changes = {};

				if (dirty & /*$$scope*/ 8) {
					tabpanel0_changes.$$scope = { dirty, ctx };
				}

				tabpanel0.$set(tabpanel0_changes);
				const tabpanel1_changes = {};

				if (dirty & /*$$scope*/ 8) {
					tabpanel1_changes.$$scope = { dirty, ctx };
				}

				tabpanel1.$set(tabpanel1_changes);

				if (
					!current ||
					(dirty & /*$isReviewPanel*/ 1 &&
						section0_class_value !==
							(section0_class_value =
								'' + (null_to_empty(/*$isReviewPanel*/ ctx[0] && 'collapse') + ' svelte-7hm1d7')))
				) {
					attr_dev(section0, 'class', section0_class_value);
				}

				if (/*$isReviewPanel*/ ctx[0]) {
					if (if_block0);
					else {
						if_block0 = create_if_block_1(ctx);
						if_block0.c();
						if_block0.m(section1, t3);
					}
				} else if (if_block0) {
					if_block0.d(1);
					if_block0 = null;
				}

				if (/*$isReviewPanel*/ ctx[0]) {
					if (if_block1) {
						if_block1.p(ctx, dirty);

						if (dirty & /*$isReviewPanel*/ 1) {
							transition_in(if_block1, 1);
						}
					} else {
						if_block1 = create_if_block(ctx);
						if_block1.c();
						transition_in(if_block1, 1);
						if_block1.m(section1, null);
					}
				} else if (if_block1) {
					group_outros();

					transition_out(if_block1, 1, 1, () => {
						if_block1 = null;
					});

					check_outros();
				}

				if (
					!current ||
					(dirty & /*$isReviewPanel*/ 1 &&
						section1_class_value !==
							(section1_class_value =
								'' + (null_to_empty(/*$isReviewPanel*/ ctx[0] && 'full') + ' svelte-7hm1d7')))
				) {
					attr_dev(section1, 'class', section1_class_value);
				}
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tablist.$$.fragment, local);
				transition_in(tabpanel0.$$.fragment, local);
				transition_in(tabpanel1.$$.fragment, local);
				transition_in(preview.$$.fragment, local);
				transition_in(if_block1);
				current = true;
			},
			o: function outro(local) {
				transition_out(tablist.$$.fragment, local);
				transition_out(tabpanel0.$$.fragment, local);
				transition_out(tabpanel1.$$.fragment, local);
				transition_out(preview.$$.fragment, local);
				transition_out(if_block1);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(tablist, detaching);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(div);
				destroy_component(tabpanel0);
				destroy_component(tabpanel1);
				if (if_block0) if_block0.d();
				destroy_component(preview);
				if (if_block1) if_block1.d();
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot$1.name,
			type: 'slot',
			source: '(14:2) <Tabs>',
			ctx,
		});

		return block;
	}

	function create_fragment$1(ctx) {
		let div;
		let h1;
		let t1;
		let tabs;
		let current;

		tabs = new Tabs({
			props: {
				$$slots: { default: [create_default_slot$1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				div = element('div');
				h1 = element('h1');
				h1.textContent = 'Design your project 🎨';
				t1 = space();
				create_component(tabs.$$.fragment);
				attr_dev(h1, 'class', 'svelte-7hm1d7');
				add_location(h1, file$1, 12, 2, 393);
				attr_dev(div, 'id', 'create');
				attr_dev(div, 'class', 'svelte-7hm1d7');
				add_location(div, file$1, 11, 0, 373);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				insert_dev(target, div, anchor);
				append_dev(div, h1);
				append_dev(div, t1);
				mount_component(tabs, div, null);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const tabs_changes = {};

				if (dirty & /*$$scope, $isReviewPanel*/ 9) {
					tabs_changes.$$scope = { dirty, ctx };
				}

				tabs.$set(tabs_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(tabs.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(tabs.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				if (detaching) detach_dev(div);
				destroy_component(tabs);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment$1.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function onClick(tabId) {
		document.getElementById(tabId).click();
	}

	function instance$1($$self, $$props, $$invalidate) {
		let $isReviewPanel;
		validate_store(isReviewPanel, 'isReviewPanel');
		component_subscribe($$self, isReviewPanel, ($$value) =>
			$$invalidate(0, ($isReviewPanel = $$value)),
		);
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('CreateProject', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console_1.warn(`<CreateProject> was created with unknown prop '${key}'`);
		});

		const func = () => onClick('funding');
		const func_1 = () => onClick('review');

		$$self.$capture_state = () => ({
			isReviewPanel,
			Tab,
			Tabs,
			TabList,
			TabPanel,
			Preview: Main,
			ProjectDetails,
			FundingCycle,
			Button,
			onClick,
			$isReviewPanel,
		});

		return [$isReviewPanel, func, func_1];
	}

	class CreateProject extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'CreateProject',
				options,
				id: create_fragment$1.name,
			});
		}
	}

	/* src/App.svelte generated by Svelte v3.48.0 */
	const file = 'src/App.svelte';

	// (10:4) <Route path="/">
	function create_default_slot_2(ctx) {
		let landinginfo;
		let current;
		landinginfo = new LandingInfo({ $$inline: true });

		const block = {
			c: function create() {
				create_component(landinginfo.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(landinginfo, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(landinginfo.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(landinginfo.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(landinginfo, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_2.name,
			type: 'slot',
			source: '(10:4) <Route path=\\"/\\">',
			ctx,
		});

		return block;
	}

	// (13:4) <Route path="create">
	function create_default_slot_1(ctx) {
		let createproject;
		let current;
		createproject = new CreateProject({ $$inline: true });

		const block = {
			c: function create() {
				create_component(createproject.$$.fragment);
			},
			m: function mount(target, anchor) {
				mount_component(createproject, target, anchor);
				current = true;
			},
			i: function intro(local) {
				if (current) return;
				transition_in(createproject.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(createproject.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(createproject, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot_1.name,
			type: 'slot',
			source: '(13:4) <Route path=\\"create\\">',
			ctx,
		});

		return block;
	}

	// (7:0) <Router>
	function create_default_slot(ctx) {
		let navbar;
		let t0;
		let main;
		let route0;
		let t1;
		let route1;
		let current;
		navbar = new Nav({ $$inline: true });

		route0 = new Route$1({
			props: {
				path: '/',
				$$slots: { default: [create_default_slot_2] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		route1 = new Route$1({
			props: {
				path: 'create',
				$$slots: { default: [create_default_slot_1] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(navbar.$$.fragment);
				t0 = space();
				main = element('main');
				create_component(route0.$$.fragment);
				t1 = space();
				create_component(route1.$$.fragment);
				attr_dev(main, 'class', 'svelte-5li0bo');
				add_location(main, file, 8, 2, 238);
			},
			m: function mount(target, anchor) {
				mount_component(navbar, target, anchor);
				insert_dev(target, t0, anchor);
				insert_dev(target, main, anchor);
				mount_component(route0, main, null);
				append_dev(main, t1);
				mount_component(route1, main, null);
				current = true;
			},
			p: function update(ctx, dirty) {
				const route0_changes = {};

				if (dirty & /*$$scope*/ 1) {
					route0_changes.$$scope = { dirty, ctx };
				}

				route0.$set(route0_changes);
				const route1_changes = {};

				if (dirty & /*$$scope*/ 1) {
					route1_changes.$$scope = { dirty, ctx };
				}

				route1.$set(route1_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(navbar.$$.fragment, local);
				transition_in(route0.$$.fragment, local);
				transition_in(route1.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(navbar.$$.fragment, local);
				transition_out(route0.$$.fragment, local);
				transition_out(route1.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(navbar, detaching);
				if (detaching) detach_dev(t0);
				if (detaching) detach_dev(main);
				destroy_component(route0);
				destroy_component(route1);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_default_slot.name,
			type: 'slot',
			source: '(7:0) <Router>',
			ctx,
		});

		return block;
	}

	function create_fragment(ctx) {
		let router;
		let current;

		router = new Router$1({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx },
			},
			$$inline: true,
		});

		const block = {
			c: function create() {
				create_component(router.$$.fragment);
			},
			l: function claim(nodes) {
				throw new Error(
					'options.hydrate only works if the component was compiled with the `hydratable: true` option',
				);
			},
			m: function mount(target, anchor) {
				mount_component(router, target, anchor);
				current = true;
			},
			p: function update(ctx, [dirty]) {
				const router_changes = {};

				if (dirty & /*$$scope*/ 1) {
					router_changes.$$scope = { dirty, ctx };
				}

				router.$set(router_changes);
			},
			i: function intro(local) {
				if (current) return;
				transition_in(router.$$.fragment, local);
				current = true;
			},
			o: function outro(local) {
				transition_out(router.$$.fragment, local);
				current = false;
			},
			d: function destroy(detaching) {
				destroy_component(router, detaching);
			},
		};

		dispatch_dev('SvelteRegisterBlock', {
			block,
			id: create_fragment.name,
			type: 'component',
			source: '',
			ctx,
		});

		return block;
	}

	function instance($$self, $$props, $$invalidate) {
		let { $$slots: slots = {}, $$scope } = $$props;
		validate_slots('App', slots, []);
		const writable_props = [];

		Object.keys($$props).forEach((key) => {
			if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot')
				console.warn(`<App> was created with unknown prop '${key}'`);
		});

		$$self.$capture_state = () => ({
			Router: Router$1,
			Route: Route$1,
			NavBar: Nav,
			LandingInfo,
			CreateProject,
		});

		return [];
	}

	class App extends SvelteComponentDev {
		constructor(options) {
			super(options);
			init(this, options, instance, create_fragment, safe_not_equal, {});

			dispatch_dev('SvelteRegisterComponent', {
				component: this,
				tagName: 'App',
				options,
				id: create_fragment.name,
			});
		}
	}

	const app = new App({
		target: document.body,
	});

	return app;
})();
//# sourceMappingURL=bundle.js.map
