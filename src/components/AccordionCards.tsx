import { useState } from "react";
import "./Styles/AccordionCards.css";

export interface AccordionItem {
  id: string | number;
  title: string;
  content: string;
  color?: string;
}

interface AccordionCardsProps {
  items: AccordionItem[];
}

const AccordionCards = ({ items }: AccordionCardsProps) => {
  const [openIds, setOpenIds] = useState<Array<string | number>>([]);

  const toggleItem = (id: string | number) => {
    setOpenIds((prev) =>
      prev.includes(id)
        ? prev.filter((openId) => openId !== id)
        : [...prev, id],
    );
  };

  return (
    <div className="accordion-container">
      {items.map((item) => {
        const isOpen = openIds.includes(item.id);

        return (
          <div
            key={item.id}
            className={`accordion-card ${isOpen ? "open" : ""}`}
          >
            <button
              className="accordion-header"
              style={{ backgroundColor: item.color || "#666" }}
              onClick={() => toggleItem(item.id)}
            >
              <span>{item.title}</span>
              <span className={`arrow ${isOpen ? "open" : ""}`}>▼</span>
            </button>

            {isOpen && (
              <div className="accordion-content">
                <p>{item.content}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AccordionCards;
