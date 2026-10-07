import unittest

from utils.embed import parse_embed_code


class ParseEmbedCodeTest(unittest.TestCase):
    def test_serial_normalized_to_series(self):
        code = 'data-publisher-id="675412712" data-type="serial" data-id="9126"'
        self.assertEqual(
            parse_embed_code(code),
            {"publisherId": "675412712", "type": "series", "id": "9126"},
        )

    def test_movie(self):
        code = 'data-publisher-id="1" data-type="movie" data-id="2"'
        self.assertEqual(parse_embed_code(code)["type"], "movie")

    def test_full_ins_tag_and_single_quotes(self):
        code = "<ins data-publisher-id='1' data-type='movie' data-id='2'></ins>"
        self.assertEqual(
            parse_embed_code(code),
            {"publisherId": "1", "type": "movie", "id": "2"},
        )

    def test_empty_or_incomplete(self):
        self.assertIsNone(parse_embed_code(""))
        self.assertIsNone(parse_embed_code(None))
        self.assertIsNone(parse_embed_code('data-publisher-id="1" data-type="movie"'))


if __name__ == "__main__":
    unittest.main()
