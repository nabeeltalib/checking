import { SearchBar } from '@/components/shared'

const Categories = () => {

    const handleSearch = (query: string) => {
        console.log("Searching for:", query);
      };

  return (
    <div>
        <SearchBar onSearch={handleSearch} />
    </div>
  )
}

export default Categories