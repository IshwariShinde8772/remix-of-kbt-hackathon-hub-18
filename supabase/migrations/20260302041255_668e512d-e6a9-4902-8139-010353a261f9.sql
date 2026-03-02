-- Make storage buckets public
UPDATE storage.buckets SET public = true WHERE id IN ('payment-proofs', 'problem-resources', 'solutions');

-- Add public SELECT policy for each bucket
CREATE POLICY "Public read access for payment-proofs"
ON storage.objects FOR SELECT
USING (bucket_id = 'payment-proofs');

CREATE POLICY "Public read access for problem-resources"
ON storage.objects FOR SELECT
USING (bucket_id = 'problem-resources');

CREATE POLICY "Public read access for solutions"
ON storage.objects FOR SELECT
USING (bucket_id = 'solutions');