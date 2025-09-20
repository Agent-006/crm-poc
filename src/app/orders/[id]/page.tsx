"use client";

import { useParams } from 'next/navigation';

const page = () => {
    const { id } = useParams();
  return (
    <div>
      order id : {id}
    </div>
  )
}

export default page

