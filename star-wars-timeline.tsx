import React from 'react';

const StarWarsTimeline = () => {
  // Movie data including release date and in-universe timeline position
  const movies = [
    {
      id: 1,
      title: "Episode I: The Phantom Menace",
      releaseYear: 1999,
      timelinePosition: 1,
      trilogy: "Prequel",
      color: "#2ecc71"
    },
    {
      id: 2,
      title: "Episode II: Attack of the Clones",
      releaseYear: 2002,
      timelinePosition: 2,
      trilogy: "Prequel",
      color: "#2ecc71"
    },
    {
      id: 3,
      title: "Episode III: Revenge of the Sith",
      releaseYear: 2005,
      timelinePosition: 3,
      trilogy: "Prequel",
      color: "#2ecc71"
    },
    {
      id: 10,
      title: "Solo: A Star Wars Story",
      releaseYear: 2018,
      timelinePosition: 4,
      trilogy: "Anthology",
      color: "#9b59b6"
    },
    {
      id: 11,
      title: "Rogue One: A Star Wars Story",
      releaseYear: 2016,
      timelinePosition: 5,
      trilogy: "Anthology",
      color: "#9b59b6"
    },
    {
      id: 4,
      title: "Episode IV: A New Hope",
      releaseYear: 1977,
      timelinePosition: 6,
      trilogy: "Original",
      color: "#3498db"
    },
    {
      id: 5,
      title: "Episode V: The Empire Strikes Back",
      releaseYear: 1980,
      timelinePosition: 7,
      trilogy: "Original",
      color: "#3498db"
    },
    {
      id: 6,
      title: "Episode VI: Return of the Jedi",
      releaseYear: 1983,
      timelinePosition: 8,
      trilogy: "Original",
      color: "#3498db"
    },
    {
      id: 7,
      title: "Episode VII: The Force Awakens",
      releaseYear: 2015,
      timelinePosition: 9,
      trilogy: "Sequel",
      color: "#e74c3c"
    },
    {
      id: 8,
      title: "Episode VIII: The Last Jedi",
      releaseYear: 2017,
      timelinePosition: 10,
      trilogy: "Sequel",
      color: "#e74c3c"
    },
    {
      id: 9,
      title: "Episode IX: The Rise of Skywalker",
      releaseYear: 2019,
      timelinePosition: 11,
      trilogy: "Sequel",
      color: "#e74c3c"
    }
  ];

  // Sort for release timeline
  const releaseOrder = [...movies].sort((a, b) => a.releaseYear - b.releaseYear);
  
  // In-universe order is already sorted by timelinePosition

  const legendItems = [
    { label: "Prequel Trilogy", color: "#2ecc71" },
    { label: "Original Trilogy", color: "#3498db" },
    { label: "Sequel Trilogy", color: "#e74c3c" },
    { label: "Anthology Films", color: "#9b59b6" }
  ];

  return (
    <div className="flex flex-col p-6 bg-gray-100 rounded-lg">
      <h1 className="text-3xl font-bold mb-8 text-center">Star Wars Movies Timeline</h1>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center mb-6 gap-4">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="flex flex-row gap-12 justify-center">
        {/* Timeline by Release Date */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-center">By Release Date</h2>
          <div className="relative h-full">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-2 bg-gray-300 rounded-full h-full"></div>
            
            {releaseOrder.map((movie, index) => (
              <div 
                key={movie.id}
                className="relative mb-16"
                style={{ 
                  marginTop: index === 0 ? '20px' : '0px'
                }}
              >
                <div className="flex items-center">
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div 
                      className="w-6 h-6 rounded-full shadow-md"
                      style={{ backgroundColor: movie.color }}
                    ></div>
                  </div>
                  
                  {/* Content - alternating sides */}
                  <div className={`ml-12 ${index % 2 === 0 ? 'mr-auto' : 'ml-auto mr-12'}`}>
                    <div className="bg-white p-3 rounded shadow-md">
                      <div className="font-medium">
                        {movie.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {movie.releaseYear}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Timeline by In-Universe Chronology */}
        <div className="w-1/2">
          <h2 className="text-2xl font-semibold mb-4 text-center">By In-Universe Chronology</h2>
          <div className="relative h-full">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-2 bg-gray-300 rounded-full h-full"></div>
            
            {movies.map((movie, index) => (
              <div 
                key={movie.id}
                className="relative mb-16"
                style={{ 
                  marginTop: index === 0 ? '20px' : '0px'
                }}
              >
                <div className="flex items-center">
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2">
                    <div 
                      className="w-6 h-6 rounded-full shadow-md"
                      style={{ backgroundColor: movie.color }}
                    ></div>
                  </div>
                  
                  {/* Content - alternating sides */}
                  <div className={`${index % 2 === 0 ? 'ml-12 mr-auto' : 'mr-12 ml-auto'}`}>
                    <div className="bg-white p-3 rounded shadow-md">
                      <div className="font-medium">
                        {movie.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {movie.releaseYear}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarWarsTimeline;
