// Generic array chunking utility.
// Splits an array into sub-arrays of at most `size` preserving order.
// If size <= 0 an empty array is returned.
export function chunk<T>(arr: T[], size: number): T[][] {
	if (!Array.isArray(arr) || size <= 0) return [];
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

// Convenience: chunk specifically for grid logic (max 3 per row)
export function chunkGrid<T>(arr: T[]): T[][] {
	return chunk(arr, 3);
}

// Optionally future: balanced last row logic could be added here.
