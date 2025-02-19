const fs = require('fs');  // Required to work with the filesystem

console.log("Script is running...");  // Confirm script execution
console.log('Node version:', process.version);  // Log Node.js version
console.log('Current working directory:', process.cwd());  // Log current directory

// Helper functions
const cleanCurrencySpan = (currencyString) => {
  return currencyString.replace(/<[^>]*>/g, '').trim();
};

const formatImageUrl = (url) => {
  return url.startsWith('http') ? url : `https:${url}`;
};

// Function to fetch Unstop hackathons data
const fetchUnstopHackathons = async (page = 1, totalPages = 100) => {
  try {
    let allHackathons = [];
    // Loop through all pages
    for (let currentPage = page; currentPage <= totalPages; currentPage++) {
      console.log(`Fetching Unstop hackathons, Page: ${currentPage}`);  // Log that the fetch is starting

      const response = await fetch(
        `https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&page=${currentPage}&per_page=15&oppstatus=open&quickApply=true`, {
          cache: 'force-cache',
        }
      );
      
      if (!response.ok) {
        console.error(`Error fetching data. Status Code: ${response.status}`);
        return [];
      }

      const data = await response.json();
      console.log('Raw data from API:', data);

      // Update totalPages dynamically if not provided
      if (currentPage === 1 && data && data.data && data.data.total_pages) {
        totalPages = data.data.total_pages; // Set total pages if it's the first page
        console.log(`Total Pages: ${totalPages}`);
      }

      if (data && data.data && data.data.data) {
        const normalizedData = data.data.data.map((hackathon) => ({
          title: hackathon.title,
          url: `https://unstop.com/${hackathon.public_url}`,
          organizer: hackathon.organisation.name,
          imageUrl: hackathon.banner_mobile.image_url,
          startDate: new Date(hackathon.start_date).toLocaleDateString(),
          endDate: new Date(hackathon.end_date).toLocaleDateString(),
          currency: hackathon.prizes[0]?.currency,
          prize: hackathon.prizes
            .reduce((acc, curr) => acc + (curr?.cash ?? 0), 0)
            .toLocaleString(),
          location: hackathon.region,
          tags: hackathon.filters.map((filter) => filter.name),
          source: 'unstop',
          registrationCount: hackathon.registerCount,
        }));

        allHackathons = [...allHackathons, ...normalizedData];
      }

      console.log(`Page ${currentPage} fetched.`);
    }

    // Save all fetched data to a file
    const fileName = 'unstop_hackathons_all_pages.json';
    fs.writeFileSync(fileName, JSON.stringify(allHackathons, null, 2)); // Save to file

    console.log(`Data from all pages saved to ${fileName}`);
    return allHackathons;

  } catch (error) {
    console.error('Error fetching Unstop hackathons:', error);
    return [];
  }
};

// Run the fetchUnstopHackathons function to retrieve and save the hackathons
(async () => {
  const unstopHackathons = await fetchUnstopHackathons(1);
  console.log(unstopHackathons);
})();
