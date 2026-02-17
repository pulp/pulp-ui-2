import React from "react";
import {
  Button,
  InputGroup,
  InputGroupItem,
  Menu,
  MenuContent,
  MenuList,
  MenuItem,
  TextInput,
} from "@patternfly/react-core";
import { SearchIcon } from "@patternfly/react-icons";
import { useNavigate, generatePath } from "react-router-dom";
import { useFetchUniquePackages } from "@app/queries/packages";
import { Paths } from "@app/Routes";

const MAX_RESULTS = 10;

interface PackageSearchBarProps {
  distributionBasePath: string;
  currentPackageName: string;
}

export const PackageSearchBar: React.FC<PackageSearchBarProps> = ({
  distributionBasePath,
  currentPackageName,
}) => {
  const [searchValue, setSearchValue] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  const { packages } = useFetchUniquePackages({
    distributionPath: distributionBasePath,
  });

  const filteredPackages = React.useMemo(() => {
    const term = searchValue.toLowerCase().trim();
    if (!term) return [];
    return packages
      .filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(term) &&
          pkg.name !== currentPackageName,
      )
      .slice(0, MAX_RESULTS);
  }, [packages, searchValue, currentPackageName]);

  const hasInput = searchValue.trim().length > 0;

  const navigateToFirst = () => {
    if (filteredPackages.length > 0) {
      navigate(
        generatePath(Paths.pythonDetails, {
          distributionBasePath,
          pythonId: filteredPackages[0].name,
        }),
      );
      setSearchValue("");
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <InputGroup>
        <InputGroupItem isFill>
          <TextInput
            type="text"
            aria-label="Search packages"
            placeholder="Search packages in this distribution"
            value={searchValue}
            onChange={(_event, value) => {
              setSearchValue(value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (hasInput) setIsOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                navigateToFirst();
              }
            }}
          />
        </InputGroupItem>
        <InputGroupItem>
          <Button
            variant="control"
            aria-label="Search"
            onClick={navigateToFirst}
          >
            <SearchIcon />
          </Button>
        </InputGroupItem>
      </InputGroup>
      {isOpen && hasInput && (
        <Menu
          style={{
            position: "absolute",
            zIndex: 200,
            width: "100%",
            boxShadow: "var(--pf-v6-global--BoxShadow--md)",
            maxHeight: "300px",
            overflow: "auto",
          }}
        >
          <MenuContent>
            <MenuList>
              {filteredPackages.length > 0 ? (
                filteredPackages.map((pkg) => (
                  <MenuItem
                    key={pkg.name}
                    onClick={() => {
                      navigate(
                        generatePath(Paths.pythonDetails, {
                          distributionBasePath,
                          pythonId: pkg.name,
                        }),
                      );
                      setSearchValue("");
                      setIsOpen(false);
                    }}
                  >
                    {pkg.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem isDisabled>No matching packages</MenuItem>
              )}
            </MenuList>
          </MenuContent>
        </Menu>
      )}
    </div>
  );
};
