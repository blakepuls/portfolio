"use client";

import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";

interface Props {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<Props> = ({ children, isOpen, onClose }) => {
  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    isOpen && (document.body.style.overflow = "hidden");
    !isOpen && (document.body.style.overflow = "unset");
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
    }
  }, [isOpen]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (isClosing) {
      timeout = setTimeout(() => {
        setShowModal(false);
        setIsClosing(false);
        onClose();
      }, 200); // Adjust the duration as needed
    }

    return () => clearTimeout(timeout);
  }, [isClosing, onClose]);

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.stopPropagation();
    setIsClosing(true);
  }

  return (
    <ReactModal
      className="outline-none"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center outline-none transition-opacity"
      ariaHideApp={false}
      shouldCloseOnOverlayClick={false} // Prevent closing on overlay click
      isOpen={isOpen}
    >
      {(showModal || isClosing) && (
        <div
          className="fixed inset-0 bg-opacity-50 flex items-center justify-center outline-none z-10 w-full h-full"
          onClick={handleOverlayClick}
        >
          <section
            className={`bg-bg-800 rounded-md ${
              isClosing
                ? "animate-shrink transition-transform duration-300"
                : "animate-grow transition-transform duration-300"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </section>
        </div>
      )}
    </ReactModal>
  );
};
export default Modal;
