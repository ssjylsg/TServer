package com.netposa.gis.server.bean;

import net.sf.ehcache.Cache;
import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Element;

public class VectorTileCache {

	private static Cache vectorTileCache = null;

	static {
		if (vectorTileCache == null) {
			vectorTileCache = CacheManager.getInstance().getCache("tileCache");
		}
	}

	public static <T> void putToCache(String key, T value) {
		Element element = new Element(key, value);
		vectorTileCache.put(element);
	}

	@SuppressWarnings("unchecked")
	public static <T> T getFromCache(String key) {
		Element element = vectorTileCache.get(key);
		return (T) element.getObjectValue();
	}

	public static boolean isKeyInCache(String key) {
		return vectorTileCache.isKeyInCache(key);
	}
}
