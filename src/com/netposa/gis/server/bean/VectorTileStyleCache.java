package com.netposa.gis.server.bean;

import java.util.LinkedHashMap;
import java.util.Map;

public class VectorTileStyleCache {

	private static final int MAX_CACHE_SIZE = 16;
	private static final float DEFAULT_LOAD_FACTORY = 0.75f;
	private static final int CAPACITY = (int) Math.ceil(MAX_CACHE_SIZE / DEFAULT_LOAD_FACTORY) + 1;
	private static LinkedHashMap<String, VectorTileStyle> map = null;

	static {
		map = new LinkedHashMap<String, VectorTileStyle>(CAPACITY, DEFAULT_LOAD_FACTORY, false) {
			private static final long serialVersionUID = 1L;

			@Override
			protected boolean removeEldestEntry(Map.Entry<String, VectorTileStyle> eldest) {
				return size() > MAX_CACHE_SIZE;
			}
		};
	}

	public static synchronized void put(String key, VectorTileStyle value) {
		map.put(key, value);
	}

	public static VectorTileStyle get(String key) {
		return map.get(key);
	}

	public static synchronized void remove(String key) {
		map.remove(key);
	}

	public static boolean containsKey(String key) {
		return map.containsKey(key);
	}

}
