"use client";

import { useEffect, useState } from "react";
import { Advocate } from "@/types/advocate";

export default function Home() {
	const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [total, setTotal] = useState(0);
	const [loadingMore, setLoadingMore] = useState(false);

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			const fetchAdvocates = async () => {
				try {
					setLoading(true);
					const searchParam = searchTerm
						? `&search=${encodeURIComponent(searchTerm)}`
						: "";
					const response = await fetch(`/api/advocates?page=1${searchParam}`);
					if (!response.ok) {
						throw new Error("Failed to fetch advocates");
					}
					const jsonResponse = await response.json();
					setFilteredAdvocates(jsonResponse.data);
					setCurrentPage(jsonResponse.page);
					setTotalPages(jsonResponse.totalPages);
					setTotal(jsonResponse.total);
				} catch (err) {
					setError(err instanceof Error ? err.message : "An error occurred");
					console.error("Error fetching advocates:", err);
				} finally {
					setLoading(false);
				}
			};

			fetchAdvocates();
		}, 300);

		return () => clearTimeout(timeoutId);
	}, [searchTerm]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value;
		setSearchTerm(searchValue);
		setCurrentPage(1);
	};

	const onClick = () => {
		setSearchTerm("");
		setCurrentPage(1);
	};

	const loadMore = async () => {
		if (currentPage >= totalPages || loadingMore) return;

		try {
			setLoadingMore(true);
			const nextPage = currentPage + 1;
			const searchParam = searchTerm
				? `&search=${encodeURIComponent(searchTerm)}`
				: "";
			const response = await fetch(
				`/api/advocates?page=${nextPage}${searchParam}`
			);
			if (!response.ok) {
				throw new Error("Failed to fetch more advocates");
			}
			const jsonResponse = await response.json();

			setFilteredAdvocates((prev) => [...prev, ...jsonResponse.data]);
			setCurrentPage(jsonResponse.page);
		} catch (err) {
			console.error("Error loading more advocates:", err);
		} finally {
			setLoadingMore(false);
		}
	};

	if (loading) {
		return (
			<main style={{ margin: "24px" }}>
				<h1>Solace Advocates</h1>
				<p>Loading advocates...</p>
			</main>
		);
	}

	if (error) {
		return (
			<main style={{ margin: "24px" }}>
				<h1>Solace Advocates</h1>
				<p style={{ color: "red" }}>Error: {error}</p>
				<button onClick={() => window.location.reload()}>Retry</button>
			</main>
		);
	}

	return (
		<main className="min-h-screen bg-gray-50">
			{/* Header Section */}
			<div className="bg-white shadow-sm border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<div className="text-center">
						<h1 className="text-4xl font-bold text-gray-900 mb-2">
							Find Your Mental Health Advocate
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Connect with experienced mental health professionals who specialize in
							your specific needs. Browse our network of qualified advocates ready to
							support your journey.
						</p>
					</div>
				</div>
			</div>

			{/* Search Section */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="max-w-md mx-auto mb-8">
					<div className="relative">
						<input
							type="text"
							value={searchTerm}
							onChange={onChange}
							placeholder="Search by name, specialty, city, or degree..."
							className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none shadow-sm"
						/>
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<svg
								className="h-5 w-5 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</div>
					</div>
					<div className="flex justify-between items-center mt-4">
						<p className="text-sm text-gray-600">
							{searchTerm
								? `Searching for: "${searchTerm}"`
								: `Showing ${filteredAdvocates.length} advocates`}
						</p>
						{searchTerm && (
							<button
								onClick={onClick}
								className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
							>
								Clear Search
							</button>
						)}
					</div>
				</div>

				{/* Advocates Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredAdvocates.map((advocate, index) => (
						<div
							key={`${advocate.firstName}-${advocate.lastName}-${index}`}
							className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
						>
							<div className="flex justify-between items-start mb-4">
								<div>
									<h3 className="text-xl font-semibold text-gray-900">
										{advocate.firstName} {advocate.lastName}
									</h3>
									<p className="text-sm text-gray-600 font-medium">{advocate.degree}</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-600">
										{advocate.yearsOfExperience} years exp.
									</p>
								</div>
							</div>

							<div className="mb-3">
								<p className="text-sm text-gray-600 flex items-center">
									<svg
										className="h-4 w-4 mr-1"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
										/>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
									{advocate.city}
								</p>
							</div>

							<div className="mb-4">
								<h4 className="text-sm font-medium text-gray-900 mb-2">Specialties:</h4>
								<div className="flex flex-wrap gap-1">
									{advocate.specialties.slice(0, 3).map((s, specIndex) => (
										<span
											key={`${s}-${specIndex}`}
											className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
										>
											{s}
										</span>
									))}
									{advocate.specialties.length > 3 && (
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
											+{advocate.specialties.length - 3} more
										</span>
									)}
								</div>
							</div>

							<div className="pt-4 border-t border-gray-200">
								<a
									href={`tel:${advocate.phoneNumber}`}
									className="flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
								>
									<svg
										className="h-4 w-4 mr-2"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
										/>
									</svg>
									{advocate.phoneNumber
										.toString()
										.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}
								</a>
							</div>
						</div>
					))}
				</div>

				{/* Load More Button */}
				{currentPage < totalPages && (
					<div className="text-center mt-8">
						<button
							onClick={loadMore}
							disabled={loadingMore}
							className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
						>
							{loadingMore ? "Loading..." : "Load More Advocates"}
						</button>
						<p className="text-sm text-gray-500 mt-2">
							Showing {filteredAdvocates.length} of {total} advocates
						</p>
					</div>
				)}

				{/* No Results Message */}
				{filteredAdvocates.length === 0 && !loading && (
					<div className="text-center py-12">
						<p className="text-gray-500 text-lg">
							No advocates found matching your search.
						</p>
						<button
							onClick={onClick}
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Show All Advocates
						</button>
					</div>
				)}
			</div>
		</main>
	);
}
